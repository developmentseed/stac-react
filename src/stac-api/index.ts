import type { GenericObject } from '../types';
import type {
  Bbox,
  SearchPayload,
  DateRange,
  CollectionsResponse,
  Collection,
  SearchResponse,
} from '../types/stac';
import { ApiError } from '../utils/ApiError';

type RequestPayload = SearchPayload;
type FetchOptions = {
  method?: string;
  payload?: RequestPayload;
  headers?: GenericObject;
};

export enum SearchMode {
  GET = 'GET',
  POST = 'POST',
}

class StacApi {
  baseUrl: string;
  options?: GenericObject;
  searchMode = SearchMode.GET;

  constructor(baseUrl: string, searchMode: SearchMode, options?: GenericObject) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.searchMode = searchMode;
    this.options = options;
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
    if (!dateRange) {
      return undefined;
    }

    const { from, to } = dateRange;

    if (from || to) {
      return `${from || '..'}/${to || '..'}`;
    } else {
      return undefined;
    }
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
  static async handleResponse<T>(response: Response): Promise<T> {
    // Some STAC APIs return errors as JSON others as string.
    // Clone the response so we can read the body as text if json fails.
    const clone = response.clone();

    if (!response.ok) {
      let detail;
      try {
        detail = await response.json();
      } catch {
        detail = await clone.text();
      }
      throw new ApiError(response.statusText, response.status, detail, response.url);
    }

    try {
      return await response.json();
    } catch (_) {
      throw new ApiError(
        'Invalid JSON Response',
        response.status,
        await clone.text(),
        response.url
      );
    }
  }

  async fetch<T>(url: string, options: Partial<FetchOptions> = {}) {
    const { method = 'GET', payload, headers = {} } = options;

    // Fetch can also throw errors on network failure, but we don't want to
    // catch those here.
    const response = await fetch(url, {
      method,
      headers: {
        ...(this.options?.headers || {}),
        ...headers,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    return StacApi.handleResponse<T>(response);
  }

  search(payload: SearchPayload, headers = {}) {
    const { ids, bbox, dateRange, collections, ...restPayload } = payload;
    const requestPayload = {
      ...restPayload,
      ids: this.makeArrayPayload(ids),
      collections: this.makeArrayPayload(collections),
      bbox: this.fixBboxCoordinateOrder(bbox),
      datetime: this.makeDatetimePayload(dateRange),
    };

    if (this.searchMode === SearchMode.POST) {
      return this.fetch<SearchResponse>(`${this.baseUrl}/search`, {
        method: 'POST',
        payload: requestPayload,
        headers,
      });
    } else {
      const query = this.payloadToQuery(requestPayload);
      return this.fetch<SearchResponse>(`${this.baseUrl}/search?${query}`, {
        method: 'GET',
        headers,
      });
    }
  }

  getCollections() {
    return this.fetch<CollectionsResponse>(`${this.baseUrl}/collections`);
  }

  getCollection(collectionId: string) {
    return this.fetch<Collection>(`${this.baseUrl}/collections/${collectionId}`);
  }

  get<T>(href: string, headers = {}) {
    return this.fetch<T>(href, { headers });
  }
}

export default StacApi;
