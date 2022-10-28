import type { Bbox, CollectionIdList, DateRange, ApiError } from '../types';

type SearchPayload = {
  bbox?: Bbox,
  collections?: CollectionIdList,
  dateRange?: DateRange
}

type RequestPayload = SearchPayload;

class StacApi {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
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

  fetch(url: string, method: string, payload: RequestPayload): Promise<Response> {
    const { bbox, dateRange, ...restPayload } = payload;

    return fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...restPayload,
        bbox: this.fixBboxCoordinateOrder(bbox),
        datetime: this.makeDatetimePayload(dateRange)
      })
    }).then(async (response) => {
      if (response.ok) {
        return response;
      }

      return this.handleError(response);
    });
  }

  search(payload: SearchPayload): Promise<Response> {
    return this.fetch(`${this.baseUrl}/search`, 'POST', payload);
  }
}

export default StacApi;
