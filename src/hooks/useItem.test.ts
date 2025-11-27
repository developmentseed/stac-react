import fetch from 'jest-fetch-mock';
import { renderHook, act, waitFor } from '@testing-library/react';
import useItem from './useItem';
import wrapper from './wrapper';

describe('useItem', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('queries item', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ id: 'abc', links: [] }))
      .mockResponseOnce(JSON.stringify({ id: 'abc' }));

    const { result } = renderHook(() => useItem('https://fake-stac-api.net/items/abc'), {
      wrapper,
    });
    await waitFor(() => expect(result.current.item).toEqual({ id: 'abc' }));
    await waitFor(() => expect(result.current.isLoading).toEqual(false));
  });

  it('handles error with JSON response', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ id: 'abc', links: [] }))
      .mockResponseOnce(JSON.stringify({ error: 'Wrong query' }), {
        status: 400,
        statusText: 'Bad Request',
      });

    const { result } = renderHook(() => useItem('https://fake-stac-api.net/items/abc'), {
      wrapper,
    });
    await waitFor(() =>
      expect(result.current.error).toEqual({
        status: 400,
        statusText: 'Bad Request',
        detail: { error: 'Wrong query' },
      })
    );
  });

  it('handles error with non-JSON response', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ id: 'abc', links: [] }))
      .mockResponseOnce('Wrong query', { status: 400, statusText: 'Bad Request' });

    const { result } = renderHook(() => useItem('https://fake-stac-api.net/items/abc'), {
      wrapper,
    });
    await waitFor(() =>
      expect(result.current.error).toEqual({
        status: 400,
        statusText: 'Bad Request',
        detail: 'Wrong query',
      })
    );
  });

  it('reloads item', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ id: 'abc', links: [] }))
      .mockResponseOnce(JSON.stringify({ id: 'abc' }))
      .mockResponseOnce(JSON.stringify({ id: 'abc', description: 'Updated' }));

    const { result } = renderHook(() => useItem('https://fake-stac-api.net/items/abc'), {
      wrapper,
    });
    await waitFor(() => expect(result.current.item).toEqual({ id: 'abc' }));

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.item).toEqual({ id: 'abc', description: 'Updated' }));
  });
});
