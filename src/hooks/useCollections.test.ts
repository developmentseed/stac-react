import fetch from 'jest-fetch-mock';
import { renderHook, act, waitFor } from '@testing-library/react';
import useCollections from './useCollections';
import wrapper from './wrapper';
import { ApiError } from '../utils/ApiError';

describe('useCollections', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('queries collections', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result } = renderHook(() => useCollections(), { wrapper });
    await waitFor(() => expect(result.current.collections).toEqual({ data: '12345' }));
    await waitFor(() =>
      expect(fetch.mock.calls[1][0]).toEqual('https://fake-stac-api.net/collections')
    );
    await waitFor(() => expect(result.current.collections).toEqual({ data: '12345' }));
    await waitFor(() => expect(result.current.isLoading).toEqual(false));
  });

  it('reloads collections', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ data: 'original' }))
      .mockResponseOnce(JSON.stringify({ data: 'reloaded' }));

    const { result } = renderHook(() => useCollections(), { wrapper });
    await waitFor(() => expect(result.current.collections).toEqual({ data: 'original' }));
    await waitFor(() => expect(result.current.isLoading).toEqual(false));

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.collections).toEqual({ data: 'reloaded' }));
  });

  it('handles error with JSON response', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ error: 'Wrong query' }), {
        status: 400,
        statusText: 'Bad Request',
      });

    const { result } = renderHook(() => useCollections(), { wrapper });

    await waitFor(() =>
      expect(result.current.error).toEqual(
        new ApiError(
          'Bad Request',
          400,
          { error: 'Wrong query' },
          'https://fake-stac-api.net/search'
        )
      )
    );
  });

  it('handles error with non-JSON response', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce('Wrong query', { status: 400, statusText: 'Bad Request' });

    const { result } = renderHook(() => useCollections(), { wrapper });
    await waitFor(() =>
      expect(result.current.error).toEqual(
        new ApiError('Bad Request', 400, 'Wrong query', 'https://fake-stac-api.net/search')
      )
    );
  });
});
