import type { ApiError, GenericObject } from '../types';
import type { Bbox, SearchPayload, DateRange, CollectionIdList } from '../types/stac';

type RequestPayload = SearchPayload;
type FetchOptions = {
  method?: string,
  payload?: RequestPayload,
  headers?: GenericObject
}

class StacApi {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
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

  makeCollectionsPayload(collections?: CollectionIdList) {
    return collections?.length ? collections : undefined;
  }

  makeDatetimePayload(dateRange?: DateRange): string | undefined {
    if (!dateRange) {
      return undefined;
    }

    const { from, to } = dateRange;

    if (from || to ) {
      return `${from || '..'}/${to || '..'}`;
    } else {
      return undefined;
    }
  }

  async handleError(response: Response) {
    const { status, statusText } = response;
    const e: ApiError = {
      status,
      statusText
    };

    // Some STAC APIs return errors as JSON others as string. 
    // Clone the response so we can read the body as text if json fails. 
    const clone = response.clone();
    try {
      e.detail = await response.json(); 
    } catch (err) {
      e.detail = await clone.text();
    }      
    return Promise.reject(e);
  }

  fetch(url: string, options: Partial<FetchOptions> = {}): Promise<Response> {
    const { method = 'GET', payload, headers = {} } = options;

    return fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: payload ? JSON.stringify(payload) : undefined
    }).then(async (response) => {
      if (response.ok) {
        return response;
      }

      return this.handleError(response);
    });
  }

  search(payload: SearchPayload, headers = {}): Promise<Response> {
    const { bbox, dateRange, collections, ...restPayload } = payload;
    const requestPayload = {
      ...restPayload,
      collections: this.makeCollectionsPayload(collections),
      bbox: this.fixBboxCoordinateOrder(bbox),
      datetime: this.makeDatetimePayload(dateRange),
      limit: 25
    };
    return this.fetch(
      `${this.baseUrl}/search`,
      { method: 'POST', payload: requestPayload, headers }
    );
  }

  getCollections(): Promise<Response> {
    return this.fetch(`${this.baseUrl}/collections`);
  }
}

export default StacApi;
