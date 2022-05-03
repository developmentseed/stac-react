type SearchPayload = {
  bbox?: Bbox
}

type RequestPayload = SearchPayload;

class ApiClient {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  fetch(url: string, method: string, payload: RequestPayload): Promise<Response> {
    return fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  search(payload: SearchPayload): Promise<Response> {
    return this.fetch(`${this.baseUrl}/search`, 'POST', payload);
  }
}

export default ApiClient;