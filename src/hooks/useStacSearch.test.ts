import fetch from 'jest-fetch-mock';
import { renderHook, act } from '@testing-library/react-hooks';
import useStacSearch from './useStacSearch';
import wrapper from './wrapper';

function parseRequestPayload(mockApiCall?: RequestInit) {
  if (!mockApiCall) {
    throw new Error('Unable to parse request payload. The mock API call is undefined.');
  }
  return JSON.parse(mockApiCall.body as string);
}

describe('useStacSearch — API supports POST', () => {
  beforeEach(() => fetch.resetMocks());

  it('includes IDs in search', async () => {
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setIds(['collection_1', 'collection_2']));
    act(() => result.current.submit());
    
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ ids: ['collection_1', 'collection_2'], limit: 25 });
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes Bbox in search', async () => {
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setBbox([-0.59, 51.24, 0.30, 51.74]));
    act(() => result.current.submit());
    
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ bbox: [-0.59, 51.24, 0.30, 51.74], limit: 25 });
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes Bbox in search in correct order', async () => {
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setBbox([0.30, 51.74, -0.59, 51.24]));
    act(() => result.current.submit());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ bbox: [-0.59, 51.24, 0.30, 51.74], limit: 25 });
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes Collections in search', async () => {
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setCollections(['wildfire', 'surface_temp']));
    act(() => result.current.submit());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ collections: ['wildfire', 'surface_temp'], limit: 25 });
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('clears collections when array is empty', async () => {
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setCollections([]));
    act(() => result.current.submit());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ limit: 25 });
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes date range in search', async () => {
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setDateRangeFrom('2022-01-17'));
    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ datetime: '2022-01-17/2022-05-17', limit: 25 });
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes open date range in search (no to-date)', async () => {
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setDateRangeFrom('2022-01-17'));
    act(() => result.current.submit());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ datetime: '2022-01-17/..', limit: 25 });
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes open date range in search (no from-date)', async () => {
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ datetime: '../2022-05-17', limit: 25 });
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('handles error with JSON response', async () => {
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify({ error: 'Wrong query' }), { status: 400, statusText: 'Bad Request' });

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.submit());
    await waitForNextUpdate();
    expect(result.current.error).toEqual({
      status: 400,
      statusText: 'Bad Request',
      detail: { error: 'Wrong query' }
    });
  });

  it('handles error with non-JSON response', async () => {
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce('Wrong query', { status: 400, statusText: 'Bad Request' });

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.submit());
    await waitForNextUpdate();
    expect(result.current.error).toEqual({
      status: 400,
      statusText: 'Bad Request',
      detail: 'Wrong query'
    });
  });

  it('includes nextPage callback', async () => {
    const response = {
      links: [{
        rel: 'next',
        type: 'application/geo+json',
        method: 'POST',
        href: 'https://example.com/stac/search',
        body: {
          limit: 25,
          token: 'next:abc123'
        }
      }]
    };
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify(response));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    await waitForNextUpdate(); // wait to set results
    expect(result.current.results).toEqual(response);
    expect(result.current.nextPage).toBeDefined();

    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    act(() => result.current.nextPage && result.current.nextPage());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[2][1]);
    expect(result.current.results).toEqual({ data: '12345' });
    expect(postPayload).toEqual(response.links[0].body);
  });

  it('includes previousPage callback', async () => {
    const response = {
      links: [{
        rel: 'prev',
        type: 'application/geo+json',
        method: 'POST',
        href: 'https://example.com/stac/search',
        body: {
          limit: 25,
          token: 'prev:abc123'
        }
      }]
    };
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify(response));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    await waitForNextUpdate(); // wait to set results
    expect(result.current.results).toEqual(response);
    expect(result.current.previousPage).toBeDefined();

    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    act(() => result.current.previousPage && result.current.previousPage());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[2][1]);
    expect(result.current.results).toEqual({ data: '12345' });
    expect(postPayload).toEqual(response.links[0].body);
  });

  it('includes previousPage callback (previous edition)', async () => {
    const response = {
      links: [{
        rel: 'previous',
        type: 'application/geo+json',
        method: 'POST',
        href: 'https://example.com/stac/search',
        body: {
          limit: 25,
          token: 'prev:abc123'
        }
      }]
    };
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify(response));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    await waitForNextUpdate(); // wait to set results
    expect(result.current.results).toEqual(response);
    expect(result.current.previousPage).toBeDefined();

    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    act(() => result.current.previousPage && result.current.previousPage());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[2][1]);
    expect(result.current.results).toEqual({ data: '12345' });
    expect(postPayload).toEqual(response.links[0].body);
  });

  it('merges pagination body', async () => {
    const response = {
      links: [{
        rel: 'previous',
        type: 'application/geo+json',
        method: 'POST',
        href: 'https://example.com/stac/search',
        body: {
          limit: 25,
          token: 'prev:abc123',
          merge: true
        }
      }]
    };
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify(response));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setBbox([-0.59, 51.24, 0.30, 51.74]));
    act(() => result.current.submit());
    await waitForNextUpdate(); // wait to set results
    expect(result.current.results).toEqual(response);
    expect(result.current.previousPage).toBeDefined();

    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    act(() => result.current.previousPage && result.current.previousPage());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[2][1]);
    expect(result.current.results).toEqual({ data: '12345' });
    expect(postPayload).toEqual({
      bbox: [-0.59, 51.24, 0.30, 51.74],
      ...response.links[0].body
    });
  });

  it('sends pagination header', async () => {
    const response = {
      links: [{
        rel: 'previous',
        type: 'application/geo+json',
        method: 'POST',
        href: 'https://example.com/stac/search',
        body: {
          limit: 25,
          token: 'prev:abc123'
        },
        headers: {
          next: '123abc'
        }
      }]
    };
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify(response));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setBbox([-0.59, 51.24, 0.30, 51.74]));
    act(() => result.current.submit());
    await waitForNextUpdate(); // wait to set results
    expect(result.current.results).toEqual(response);
    expect(result.current.previousPage).toBeDefined();

    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    act(() => result.current.previousPage && result.current.previousPage());
    await waitForNextUpdate();

    expect(result.current.results).toEqual({ data: '12345' });
    const postHeader = fetch.mock.calls[2][1]?.headers;
    expect(postHeader).toEqual({ 'Content-Type': 'application/json', next: '123abc' });
  });

  it('loads next-page from GET request', async () => {
    const response = {
      links: [{
        rel: 'next',
        href: 'https://fake-stac-api.net/?page=2'
      }]
    };
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify(response));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    await waitForNextUpdate(); // wait to set results
    expect(result.current.results).toEqual(response);
    expect(result.current.nextPage).toBeDefined();

    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    act(() => result.current.nextPage && result.current.nextPage());
    await waitForNextUpdate();

    expect(fetch.mock.calls[2][0]).toEqual('https://fake-stac-api.net/?page=2');
    expect(fetch.mock.calls[2][1]?.method).toEqual('GET');
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('loads prev-page from GET request', async () => {
    const response = {
      links: [{
        rel: 'prev',
        href: 'https://fake-stac-api.net/?page=2'
      }]
    };
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify(response));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    await waitForNextUpdate(); // wait to set results
    expect(result.current.results).toEqual(response);
    expect(result.current.previousPage).toBeDefined();

    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    act(() => result.current.previousPage && result.current.previousPage());
    await waitForNextUpdate();

    expect(fetch.mock.calls[2][0]).toEqual('https://fake-stac-api.net/?page=2');
    expect(fetch.mock.calls[2][1]?.method).toEqual('GET');
    expect(result.current.results).toEqual({ data: '12345' });
  });

  // it('should reset state with each new StacApi instance', async () => {
  //   const bbox: Bbox = [-0.59, 51.24, 0.30, 51.74];
  //   fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));

  //   const { result, rerender, waitForNextUpdate } = renderHook(
  //     ({ stacApi }) => useStacSearch(stacApi), {
  //       initialProps: { stacApi },
  //     }
  //   );

  //   act(() => result.current.setBbox(bbox));
  //   act(() => result.current.submit());
  //   await waitForNextUpdate();

  //   expect(result.current.results).toEqual({ data: '12345' });
  //   expect(result.current.bbox).toEqual(bbox);

  //   const newStac = new StacApi('https://otherstack.com', SearchMode.POST);
  //   rerender({ stacApi: newStac });
  //   expect(result.current.results).toBeUndefined();
  //   expect(result.current.bbox).toBeUndefined();
  // });
});

describe('useStacSearch — API supports GET', () => {
  beforeEach(() => fetch.resetMocks());

  it('includes Bbox in search', async () => {
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setBbox([-0.59, 51.24, 0.30, 51.74]));
    act(() => result.current.submit());
    await waitForNextUpdate();

    expect(fetch.mock.calls[1][0]).toEqual('https://fake-stac-api.net/search?bbox=-0.59%2C51.24%2C0.3%2C51.74&limit=25');
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes Collections in search', async () => {
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setCollections(['wildfire', 'surface_temp']));
    act(() => result.current.submit());
    await waitForNextUpdate();

    expect(fetch.mock.calls[1][0]).toEqual('https://fake-stac-api.net/search?collections=wildfire%2Csurface_temp&limit=25');
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes date range in search', async () => {
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setDateRangeFrom('2022-01-17'));
    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    await waitForNextUpdate();

    expect(fetch.mock.calls[1][0]).toEqual('https://fake-stac-api.net/search?datetime=2022-01-17%2F2022-05-17&limit=25');
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes open date range in search (no to-date)', async () => {
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setDateRangeFrom('2022-01-17'));
    act(() => result.current.submit());
    await waitForNextUpdate();

    expect(fetch.mock.calls[1][0]).toEqual('https://fake-stac-api.net/search?datetime=2022-01-17%2F..&limit=25');
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes open date range in search (no from-date)', async () => {
    fetch
      .mockResponseOnce(
        JSON.stringify({ links: [] }),
        { url: 'https://fake-stac-api.net' }
      )
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(),
      { wrapper }
    );
    await waitForNextUpdate();

    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    await waitForNextUpdate();

    expect(fetch.mock.calls[1][0]).toEqual('https://fake-stac-api.net/search?datetime=..%2F2022-05-17&limit=25');
    expect(result.current.results).toEqual({ data: '12345' });
  });
});
