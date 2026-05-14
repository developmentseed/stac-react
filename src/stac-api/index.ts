import type { GenericObject } from '../types';
import type { Bbox, SearchPayload, DateRange } from '../types/stac';

type RequestPayload = SearchPayload;
type FetchOptions = {
  method?: string;
  payload?: RequestPayload;
  headers?: GenericObject;
};

/**
 * Resolves request options at call time. Pass a function form of
 * `options` when values must vary across renders (e.g. an auth header
 * driven by a token that rotates) without rebuilding the StacApi
 * instance.
 *
 * stac-react does no scoping of these options — they're sent on every
 * request `StacApi.fetch` issues, including any URL the caller passes
 * (item asset hrefs, etc.). If you need to keep secrets off external
 * URLs, gate at the consumer (e.g. don't route external URLs through
 * `stacApi.fetch`, or wrap it with your own URL check).
 *
 * @example
 * ```tsx
 * const tokenRef = useRef<string | undefined>();
 * useEffect(() => { tokenRef.current = oidc.user?.access_token; }, [oidc.user]);
 *
 * <StacApiProvider
 *   apiUrl={url}
 *   options={() => {
 *     const t = tokenRef.current;
 *     return t ? { headers: { Authorization: `Bearer ${t}` } } : undefined;
 *   }}
 * />
 * ```
 */
export type OptionsGetter = () => GenericObject | undefined;

export enum SearchMode {
  GET = 'GET',
  POST = 'POST',
}

class StacApi {
  baseUrl: string;
  options?: GenericObject | OptionsGetter;
  searchMode = SearchMode.GET;

  constructor(
    baseUrl: string,
    searchMode: SearchMode,
    options?: GenericObject | OptionsGetter,
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.searchMode = searchMode;
    this.options = options;
  }

  private resolveOptions(): GenericObject | undefined {
    return typeof this.options === 'function' ? this.options() : this.options;
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
   * Header precedence (last wins): instance `options.headers` (resolved
   * at call time when `options` is a function) → per-call `headers`.
   */
  async fetch(url: string, options: Partial<FetchOptions> = {}): Promise<Response> {
    const { method = 'GET', payload, headers = {} } = options;
    const resolved = this.resolveOptions();

    return fetch(url, {
      method,
      headers: {
        ...resolved?.headers,
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
