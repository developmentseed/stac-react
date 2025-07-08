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
      'https://fake-stac-api.net/collections?limit=10'
    );
    expect(result.current.collections).toEqual({ data: '12345' });
    expect(result.current.state).toEqual('IDLE');
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
});
