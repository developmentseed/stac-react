import type { ApiErrorType, GenericObject } from '../types';
import type { Bbox, SearchPayload, DateRange } from '../types/stac';

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

  async handleError(response: Response) {
    const { status, statusText } = response;
    const e: ApiErrorType = {
      status,
      statusText,
    };

    // Some STAC APIs return errors as JSON others as string.
    // Clone the response so we can read the body as text if json fails.
    const clone = response.clone();
    try {
      e.detail = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      e.detail = await clone.text();
    }
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    return Promise.reject(e);
  }

  fetch(url: string, options: Partial<FetchOptions> = {}): Promise<Response> {
    const { method = 'GET', payload, headers = {} } = options;

    return fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...this.options?.headers,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    }).then(async (response) => {
      if (response.ok) {
        return response;
      }

      return this.handleError(response);
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
        headers,
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
