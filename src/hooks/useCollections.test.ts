import fetch from 'jest-fetch-mock';
import { renderHook, act } from '@testing-library/react-hooks';
import useCollections from './useCollections';
import wrapper from './wrapper';

describe('useCollections', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('queries collections', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), {
        url: 'https://fake-stac-api.net'
      })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(() => useCollections(), {
      wrapper
    });
    await waitForNextUpdate();
    await waitForNextUpdate();
    expect(fetch.mock.calls[1][0]).toEqual(
      'https://fake-stac-api.net/collections'
    );
    expect(result.current.collections).toEqual({ data: '12345' });
    expect(result.current.state).toEqual('IDLE');
    expect(result.current.nextPage).toEqual(undefined);
    expect(result.current.prevPage).toEqual(undefined);
  });

  it('reloads collections', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), {
        url: 'https://fake-stac-api.net'
      })
      .mockResponseOnce(JSON.stringify({ data: 'original' }))
      .mockResponseOnce(JSON.stringify({ data: 'reloaded' }));

    const { result, waitForNextUpdate } = renderHook(() => useCollections(), {
      wrapper
    });
    await waitForNextUpdate();
    await waitForNextUpdate();
    expect(result.current.collections).toEqual({ data: 'original' });

    expect(result.current.state).toEqual('IDLE');
    act(() => result.current.reload());

    await waitForNextUpdate();
    expect(result.current.collections).toEqual({ data: 'reloaded' });
  });

  it('handles error with JSON response', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), {
        url: 'https://fake-stac-api.net'
      })
      .mockResponseOnce(JSON.stringify({ error: 'Wrong query' }), {
        status: 400,
        statusText: 'Bad Request'
      });

    const { result, waitForNextUpdate } = renderHook(() => useCollections(), {
      wrapper
    });

    await waitForNextUpdate();
    await waitForNextUpdate();

    expect(result.current.error).toEqual({
      status: 400,
      statusText: 'Bad Request',
      detail: { error: 'Wrong query' }
    });
  });

  it('handles error with non-JSON response', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), {
        url: 'https://fake-stac-api.net'
      })
      .mockResponseOnce('Wrong query', {
        status: 400,
        statusText: 'Bad Request'
      });

    const { result, waitForNextUpdate } = renderHook(() => useCollections(), {
      wrapper
    });
    await waitForNextUpdate();
    await waitForNextUpdate();
    expect(result.current.error).toEqual({
      status: 400,
      statusText: 'Bad Request',
      detail: 'Wrong query'
    });
  });

  it('queries collections with pagination', async () => {
    const mockPage1 = {
      data: '12345',
      links: [
        { rel: 'next', href: 'https://fake-stac-api.net/collections?page=2' }
      ]
    };

    const mockPage2 = {
      data: '67890',
      links: [
        { rel: 'next', href: 'https://fake-stac-api.net/collections?page=3' },
        { rel: 'prev', href: 'https://fake-stac-api.net/collections?page=1' }
      ]
    };

    const mockPage3 = {
      data: 'abcde',
      links: [
        { rel: 'prev', href: 'https://fake-stac-api.net/collections?page=2' }
      ]
    };

    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), {
        url: 'https://fake-stac-api.net'
      })
      .mockResponses(
        JSON.stringify(mockPage1),
        JSON.stringify(mockPage2),
        JSON.stringify(mockPage3),
        JSON.stringify(mockPage2)
      );


    const { result, waitForNextUpdate } = renderHook(() => useCollections(), {
      wrapper
    });
    await waitForNextUpdate();
    await waitForNextUpdate();
    expect(fetch.mock.calls[1][0]).toEqual(
      'https://fake-stac-api.net/collections'
    );
    expect(result.current.collections).toEqual(mockPage1);
    expect(result.current.state).toEqual('IDLE');
    expect(typeof result.current.nextPage).toBe('function');
    expect(result.current.prevPage).toEqual(undefined);

    act(() => result.current.nextPage?.());
    await waitForNextUpdate();

    expect(fetch.mock.calls[2][0]).toEqual(
      'https://fake-stac-api.net/collections?page=2'
    );
    expect(result.current.collections).toEqual(mockPage2);
    expect(result.current.state).toEqual('IDLE');
    expect(typeof result.current.prevPage).toBe('function');
    expect(typeof result.current.nextPage).toBe('function');

    act(() => result.current.nextPage?.());
    await waitForNextUpdate();
    expect(fetch.mock.calls[3][0]).toEqual(
      'https://fake-stac-api.net/collections?page=3'
    );
    expect(result.current.collections).toEqual(mockPage3);
    expect(result.current.state).toEqual('IDLE');
    expect(typeof result.current.prevPage).toBe('function');
    expect(result.current.nextPage).toEqual(undefined);

    act(() => result.current.prevPage?.());
    await waitForNextUpdate();
    expect(fetch.mock.calls[4][0]).toEqual(
      'https://fake-stac-api.net/collections?page=2'
    );
    expect(result.current.collections).toEqual(mockPage2);
    expect(result.current.state).toEqual('IDLE');
    expect(typeof result.current.prevPage).toBe('function');
    expect(typeof result.current.nextPage).toBe('function');
  });
});
