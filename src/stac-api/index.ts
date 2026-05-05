import type { GenericObject } from '../types';
import type { Bbox, SearchPayload, DateRange } from '../types/stac';

type RequestPayload = SearchPayload;
type FetchOptions = {
  method?: string;
  payload?: RequestPayload;
  headers?: GenericObject;
};

/**
 * Returns the auth headers to inject for the current request, or
 * `undefined` when unauthenticated. Invoked per-request so callers can
 * return fresh values without rebuilding the StacApi instance.
 *
 * Headers are only injected for in-domain requests (URLs whose origin and
 * path are under {@link StacApi#baseUrl}) so secrets never leak to
 * external resources such as presigned asset hrefs returned by STAC items.
 *
 * @example
 * ```tsx
 * const tokenRef = useRef<string | undefined>();
 * useEffect(() => { tokenRef.current = oidc.user?.access_token; }, [oidc.user]);
 *
 * <StacApiProvider
 *   apiUrl={url}
 *   getAuthHeaders={() => {
 *     const t = tokenRef.current;
 *     return t ? { Authorization: `Bearer ${t}` } : undefined;
 *   }}
 * />
 * ```
 */
export type AuthHeadersGetter = () => Record<string, string> | undefined;

export type StacApiInit = {
  baseUrl: string;
  searchMode: SearchMode;
  options?: GenericObject;
  getAuthHeaders?: AuthHeadersGetter;
};

export enum SearchMode {
  GET = 'GET',
  POST = 'POST',
}

class StacApi {
  baseUrl: string;
  options?: GenericObject;
  searchMode = SearchMode.GET;
  private getAuthHeaders?: AuthHeadersGetter;

  constructor(init: StacApiInit) {
    this.baseUrl = init.baseUrl.replace(/\/+$/, '');
    this.searchMode = init.searchMode;
    this.options = init.options;
    this.getAuthHeaders = init.getAuthHeaders;
  }

  /**
   * True when `url` shares the same origin as `baseUrl` and its path is at
   * or under `baseUrl.pathname`. Uses URL parsing (not string-prefix) so
   * default ports, host casing, querystrings, and fragments don't produce
   * false negatives, and prefix-collision hosts (`api.example.com.evil`)
   * don't produce false positives. Returns false on parse failure.
   */
  private isInDomain(url: string): boolean {
    let target: URL;
    let base: URL;
    try {
      target = new URL(url);
      base = new URL(this.baseUrl);
    } catch {
      return false;
    }
    if (target.origin !== base.origin) return false;
    const basePath = base.pathname.endsWith('/') ? base.pathname : `${base.pathname}/`;
    const targetPath = target.pathname.endsWith('/')
      ? target.pathname
      : `${target.pathname}/`;
    return targetPath === basePath || targetPath.startsWith(basePath);
  }

  /**
   * Resolve the auth headers to merge into a request. Empty unless a
   * getter is configured, the URL is in-domain, and the getter returns
   * a non-empty record.
   */
  private buildAuthHeaders(url: string): Record<string, string> {
    if (!this.getAuthHeaders) return {};
    if (!this.isInDomain(url)) return {};
    return this.getAuthHeaders() ?? {};
  }

  fixBboxCoordinateOrder(bbox?: Bbox): Bbox | undefined {
    if (!bbox) {
      return undefined;
    }

    const [lonMin, latMin, lonMax, latMax] = bbox;
    const sortedBbox: Bbox = [lonMin, latMin, lonMax, latMax];

    if (lonMin > lonMax) {
      sortedBbox[0] = lonMax;
      sortedBbox[2] = lonMin;
    }

    if (latMin > latMax) {
      sortedBbox[1] = latMax;
      sortedBbox[3] = latMin;
    }

    return sortedBbox;
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  makeArrayPayload(arr?: any[]) {
    return arr?.length ? arr : undefined;
  }

  makeDatetimePayload(dateRange?: DateRange): string | undefined {
    if (!dateRange?.from && !dateRange?.to) {
      return undefined;
    }

    const formatDate = (date: string | undefined, end?: boolean) => {
      if (!date) return '..';

      const timePart = end ? 'T23:59:59Z' : 'T00:00:00Z';
      return date.includes('T') ? date : `${date}${timePart}`;
    };

    return `${formatDate(dateRange?.from)}/${formatDate(dateRange?.to, true)}`;
  }

  payloadToQuery({ sortby, ...payload }: SearchPayload): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryObj: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(payload)) {
      if (!value) continue;

      if (Array.isArray(value)) {
        queryObj[key] = value.join(',');
      } else {
        queryObj[key] = value;
      }
    }

    if (sortby) {
      queryObj['sortby'] = sortby
        .map(({ field, direction }) => `${direction === 'asc' ? '+' : '-'}${field}`)
        .join(',');
    }

    return new URLSearchParams(queryObj).toString();
  }

  /**
   * Issue a request through the configured fetch implementation.
   *
   * Header precedence (last wins): auto-injected auth (from
   * {@link AuthHeadersGetter}, in-domain only) → instance `options.headers`
   * → per-call `headers`. Callers can suppress the injected header by
   * passing `Authorization: ''` (or any explicit value), but cannot
   * escalate to a token they don't already have.
   *
   * Redirect note: this method does not override `redirect`, so the global
   * `fetch` default (`'follow'`) applies. Browsers strip `Authorization`
   * on cross-origin redirects, but non-browser fetch implementations may
   * not. If your STAC backend can 30x to a third-party host, configure
   * the backend to avoid that or pass `redirect: 'manual'` via
   * `options.headers` host-side configuration; the library does not
   * re-check `isInDomain` after a redirect.
   */
  async fetch(url: string, options: Partial<FetchOptions> = {}): Promise<Response> {
    const { method = 'GET', payload, headers = {} } = options;

    return fetch(url, {
      method,
      headers: {
        // Auto-injected auth is a default that instance and call-time
        // headers can override (suppress only — never escalate).
        ...this.buildAuthHeaders(url),
        ...this.options?.headers,
        ...headers,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });
  }

  search(payload: SearchPayload, headers = {}): Promise<Response> {
    const { ids, bbox, dateRange, collections, ...restPayload } = payload;
    const requestPayload = {
      ...restPayload,
      ids: this.makeArrayPayload(ids),
      collections: this.makeArrayPayload(collections),
      bbox: this.fixBboxCoordinateOrder(bbox),
      datetime: this.makeDatetimePayload(dateRange),
    };

    if (this.searchMode === SearchMode.POST) {
      return this.fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        payload: requestPayload,
        headers: { 'Content-Type': 'application/json', ...headers },
      });
    } else {
      const query = this.payloadToQuery(requestPayload);
      return this.fetch(`${this.baseUrl}/search?${query}`, { method: 'GET', headers });
    }
  }

  getCollections(): Promise<Response> {
    return this.fetch(`${this.baseUrl}/collections`);
  }

  getCollection(collectionId: string): Promise<Response> {
    return this.fetch(`${this.baseUrl}/collections/${collectionId}`);
  }

  get(href: string, headers = {}): Promise<Response> {
    return this.fetch(href, { headers });
  }
}

export default StacApi;
