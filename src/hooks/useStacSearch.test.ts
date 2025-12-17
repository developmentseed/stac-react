import fetch from 'jest-fetch-mock';
import { renderHook, act, waitFor } from '@testing-library/react';
import useStacSearch from './useStacSearch';
import wrapper from './wrapper';
import { ApiError } from '../utils/ApiError';

function parseRequestPayload(mockApiCall?: RequestInit) {
  if (!mockApiCall) {
    throw new Error('Unable to parse request payload. The mock API call is undefined.');
  }
  return JSON.parse(mockApiCall.body as string);
}

async function setupStacSearch() {
  const { result } = renderHook(() => useStacSearch(), { wrapper });
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  await act(async () => {});
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  return result;
}

describe('useStacSearch — API supports POST', () => {
  beforeEach(() => {
    fetch.resetMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('includes IDs in search', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setIds(['collection_1', 'collection_2']));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual({ data: '12345' }));
    // Validate POST payload
    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ ids: ['collection_1', 'collection_2'], limit: 25 });
  });

  it('includes Bbox in search', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setBbox([-0.59, 51.24, 0.3, 51.74]));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual({ data: '12345' }));
    // Validate POST payload
    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ bbox: [-0.59, 51.24, 0.3, 51.74], limit: 25 });
  });

  it('includes Bbox in search in correct order', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setBbox([0.3, 51.74, -0.59, 51.24]));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual({ data: '12345' }));
    // Validate POST payload
    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ bbox: [-0.59, 51.24, 0.3, 51.74], limit: 25 });
  });

  it('includes Collections in search', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setCollections(['wildfire', 'surface_temp']));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual({ data: '12345' }));
    // Validate POST payload
    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ collections: ['wildfire', 'surface_temp'], limit: 25 });
  });

  it('clears collections when array is empty', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setCollections([]));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual({ data: '12345' }));
    // Validate POST payload
    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ limit: 25 });
  });

  it('includes date range in search', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setDateRangeFrom('2022-01-17'));
    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual({ data: '12345' }));
    // Validate POST payload
    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({
      datetime: '2022-01-17T00:00:00Z/2022-05-17T23:59:59Z',
      limit: 25,
    });
  });

  it('includes open date range in search (no to-date)', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setDateRangeFrom('2022-01-17'));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual({ data: '12345' }));
    // Validate POST payload
    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ datetime: '2022-01-17T00:00:00Z/..', limit: 25 });
  });

  it('includes open date range in search (no from-date)', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual({ data: '12345' }));
    // Validate POST payload
    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ datetime: '../2022-05-17T23:59:59Z', limit: 25 });
  });

  it('handles error with JSON response', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify({ error: 'Wrong query' }), {
        status: 400,
        statusText: 'Bad Request',
      });

    const result = await setupStacSearch();

    // Submit (debounced)
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for error to be set in state
    await waitFor(() => {
      expect(result.current.error).toEqual(
        new ApiError(
          'Bad Request',
          400,
          { error: 'Wrong query' },
          'https://fake-stac-api.net/search'
        )
      );
    });
  });

  it('handles error with non-JSON response', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce('Wrong query', { status: 400, statusText: 'Bad Request' });

    const result = await setupStacSearch();

    // Submit (debounced)
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});

    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for error to be set in state
    await waitFor(() =>
      expect(result.current.error).toEqual(
        new ApiError('Bad Request', 400, 'Wrong query', 'https://fake-stac-api.net/search')
      )
    );
  });

  it('includes nextPage callback', async () => {
    const response = {
      links: [
        {
          rel: 'next',
          type: 'application/geo+json',
          method: 'POST',
          href: 'https://example.com/stac/search',
          body: {
            limit: 25,
            token: 'next:abc123',
          },
        },
      ],
    };
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify(response));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual(response));
    // Wait for pagination links to be extracted from results
    await waitFor(() => expect(result.current.nextPage).toBeDefined());
    // Trigger nextPage and validate
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    act(() => result.current.nextPage && result.current.nextPage());
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const postPayload = parseRequestPayload(fetch.mock.calls[2][1]);
    expect(result.current.results).toEqual({ data: '12345' });
    expect(postPayload).toEqual(response.links[0].body);
  });

  it('includes previousPage callback', async () => {
    const response = {
      links: [
        {
          rel: 'prev',
          type: 'application/geo+json',
          method: 'POST',
          href: 'https://example.com/stac/search',
          body: {
            limit: 25,
            token: 'prev:abc123',
          },
        },
      ],
    };
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify(response));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual(response));
    // Wait for pagination links to be extracted from results
    await waitFor(() => expect(result.current.previousPage).toBeDefined());
    // Trigger previousPage and validate
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    act(() => result.current.previousPage && result.current.previousPage());
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const postPayload = parseRequestPayload(fetch.mock.calls[2][1]);
    expect(result.current.results).toEqual({ data: '12345' });
    expect(postPayload).toEqual(response.links[0].body);
  });

  it('includes previousPage callback (previous edition)', async () => {
    const response = {
      links: [
        {
          rel: 'previous',
          type: 'application/geo+json',
          method: 'POST',
          href: 'https://example.com/stac/search',
          body: {
            limit: 25,
            token: 'prev:abc123',
          },
        },
      ],
    };
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify(response));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual(response));
    // Wait for pagination links to be extracted from results
    await waitFor(() => expect(result.current.previousPage).toBeDefined());
    // Trigger previousPage and validate
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    act(() => result.current.previousPage && result.current.previousPage());
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const postPayload = parseRequestPayload(fetch.mock.calls[2][1]);
    expect(result.current.results).toEqual({ data: '12345' });
    expect(postPayload).toEqual(response.links[0].body);
  });

  it('merges pagination body', async () => {
    const response = {
      links: [
        {
          rel: 'previous',
          type: 'application/geo+json',
          method: 'POST',
          href: 'https://example.com/stac/search',
          body: {
            limit: 25,
            token: 'prev:abc123',
            merge: true,
          },
        },
      ],
    };
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify(response));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setBbox([-0.59, 51.24, 0.3, 51.74]));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual(response));
    // Wait for pagination links to be extracted from results
    await waitFor(() => expect(result.current.previousPage).toBeDefined());
    // Trigger previousPage and validate merged body
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    act(() => result.current.previousPage && result.current.previousPage());
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const postPayload = parseRequestPayload(fetch.mock.calls[2][1]);
    expect(result.current.results).toEqual({ data: '12345' });
    expect(postPayload).toEqual({
      bbox: [-0.59, 51.24, 0.3, 51.74],
      ...response.links[0].body,
    });
  });

  it('sends pagination header', async () => {
    const response = {
      links: [
        {
          rel: 'previous',
          type: 'application/geo+json',
          method: 'POST',
          href: 'https://example.com/stac/search',
          body: {
            limit: 25,
            token: 'prev:abc123',
          },
          headers: {
            next: '123abc',
          },
        },
      ],
    };
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify(response));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setBbox([-0.59, 51.24, 0.3, 51.74]));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual(response));
    // Wait for pagination links to be extracted from results
    await waitFor(() => expect(result.current.previousPage).toBeDefined());
    // Trigger previousPage and validate header
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    act(() => result.current.previousPage && result.current.previousPage());
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.results).toEqual({ data: '12345' });
    const postHeader = fetch.mock.calls[2][1]?.headers;
    expect(postHeader).toEqual({ 'Content-Type': 'application/json', next: '123abc' });
  });

  it('loads next-page from GET request', async () => {
    const response = {
      links: [
        {
          rel: 'next',
          href: 'https://fake-stac-api.net/?page=2',
        },
      ],
    };
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify(response));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual(response));
    // Wait for pagination links to be extracted from results
    await waitFor(() => expect(result.current.nextPage).toBeDefined());
    // Trigger nextPage and validate GET request
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    act(() => result.current.nextPage && result.current.nextPage());
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetch.mock.calls[2][0]).toEqual('https://fake-stac-api.net/?page=2');
    expect(fetch.mock.calls[2][1]?.method).toEqual('GET');
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('loads prev-page from GET request', async () => {
    const response = {
      links: [
        {
          rel: 'prev',
          href: 'https://fake-stac-api.net/?page=2',
        },
      ],
    };
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify(response));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual(response));
    // Wait for pagination links to be extracted from results
    await waitFor(() => expect(result.current.previousPage).toBeDefined());
    // Trigger previousPage and validate GET request
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    act(() => result.current.previousPage && result.current.previousPage());
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetch.mock.calls[2][0]).toEqual('https://fake-stac-api.net/?page=2');
    expect(fetch.mock.calls[2][1]?.method).toEqual('GET');
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes sortBy in search', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setSortby([{ field: 'id', direction: 'asc' }]));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual({ data: '12345' }));
    // Validate POST payload
    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ sortby: [{ field: 'id', direction: 'asc' }], limit: 25 });
  });

  it('includes limit in search', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] }), {
        url: 'https://fake-stac-api.net',
      })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setLimit(50));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for the search request to complete (second fetch call)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Wait for results to be set in state
    await waitFor(() => expect(result.current.results).toEqual({ data: '12345' }));
    // Validate POST payload
    const postPayload = parseRequestPayload(fetch.mock.calls[1][1]);
    expect(postPayload).toEqual({ limit: 50 });
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
  beforeEach(() => {
    fetch.resetMocks();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('includes Bbox in search', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setBbox([-0.59, 51.24, 0.3, 51.74]));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for state to be IDLE
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Assert fetch URL and results
    expect(fetch.mock.calls[1][0]).toEqual(
      'https://fake-stac-api.net/search?limit=25&bbox=-0.59%2C51.24%2C0.3%2C51.74'
    );
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes Collections in search', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setCollections(['wildfire', 'surface_temp']));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for state to be IDLE
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Assert fetch URL and results
    expect(fetch.mock.calls[1][0]).toEqual(
      'https://fake-stac-api.net/search?limit=25&collections=wildfire%2Csurface_temp'
    );
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes date range in search', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setDateRangeFrom('2022-01-17'));
    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for state to be IDLE and fetch to be called twice
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Assert fetch URL and results
    expect(fetch.mock.calls[1][0]).toEqual(
      'https://fake-stac-api.net/search?limit=25&datetime=2022-01-17T00%3A00%3A00Z%2F2022-05-17T23%3A59%3A59Z'
    );
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes open date range in search (no to-date)', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setDateRangeFrom('2022-01-17'));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for state to be IDLE and fetch to be called twice
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Assert fetch URL and results
    expect(fetch.mock.calls[1][0]).toEqual(
      'https://fake-stac-api.net/search?limit=25&datetime=2022-01-17T00%3A00%3A00Z%2F..'
    );
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes open date range in search (no from-date)', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for state to be IDLE and fetch to be called twice
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Assert fetch URL and results
    expect(fetch.mock.calls[1][0]).toEqual(
      'https://fake-stac-api.net/search?limit=25&datetime=..%2F2022-05-17T23%3A59%3A59Z'
    );
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes sortby', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() =>
      result.current.setSortby([
        { field: 'id', direction: 'asc' },
        { field: 'properties.cloud', direction: 'desc' },
      ])
    );
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for state to be IDLE and fetch to be called twice
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Assert fetch URL and results
    expect(fetch.mock.calls[1][0]).toEqual(
      'https://fake-stac-api.net/search?limit=25&sortby=%2Bid%2C-properties.cloud'
    );
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes limit', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const result = await setupStacSearch();

    // Set search parameters and submit (debounced)
    act(() => result.current.setLimit(50));
    act(() => result.current.submit());
    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Flush microtasks to ensure debounced function and state updates complete
    await act(async () => {});
    // Wait for state to be IDLE and fetch to be called twice
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    // Assert fetch URL and results
    expect(fetch.mock.calls[1][0]).toEqual('https://fake-stac-api.net/search?limit=50');
    expect(result.current.results).toEqual({ data: '12345' });
  });
});
