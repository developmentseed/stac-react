import type { Bbox, CollectionIdList, DateRange } from '../types';

type SearchPayload = {
  bbox?: Bbox,
  collections?: CollectionIdList,
  dateRange?: DateRange
}

type RequestPayload = SearchPayload;

class ApiClient {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
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

  fetch(url: string, method: string, payload: RequestPayload): Promise<Response> {
    const { dateRange, ...restPayload } = payload;

    return fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...restPayload,
        datetime: this.makeDatetimePayload(dateRange)
      })
    });
  }

  search(payload: SearchPayload): Promise<Response> {
    return this.fetch(`${this.baseUrl}/search`, 'POST', payload);
  }
}

export default ApiClient;
