import fetch from 'jest-fetch-mock';
import { renderHook, act, waitFor } from '@testing-library/react';
import useCollection from './useCollection';
import wrapper from './wrapper';
import { ApiError } from '../utils/ApiError';

describe('useCollection', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('queries collection', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ id: 'abc', title: 'Collection A' }));

    const { result } = renderHook(() => useCollection('abc'), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toEqual(false));
    await waitFor(() =>
      expect(result.current.collection).toEqual({ id: 'abc', title: 'Collection A' })
    );
    expect(fetch.mock.calls[1][0]).toEqual('https://fake-stac-api.net/collections/abc');
  });

  it('returns error if collection does not exist', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ error: 'Collection not found' }), {
        status: 404,
        statusText: 'Not Found',
      });

    const { result } = renderHook(() => useCollection('nonexistent'), { wrapper });
    await waitFor(() =>
      expect(result.current.error).toEqual(
        new ApiError(
          'Not Found',
          404,
          { error: 'Collection not found' },
          'https://fake-stac-api.net/collections/nonexistent'
        )
      )
    );
  });

  it('handles error with JSON response', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ error: 'Wrong query' }), {
        status: 400,
        statusText: 'Bad Request',
      });

    const { result } = renderHook(() => useCollection('abc'), { wrapper });
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

    const { result } = renderHook(() => useCollection('abc'), { wrapper });
    await waitFor(() =>
      expect(result.current.error).toEqual(
        new ApiError('Bad Request', 400, 'Wrong query', 'https://fake-stac-api.net/search')
      )
    );
  });

  it('reloads collection', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ id: 'abc', title: 'Collection A' }))
      .mockResponseOnce(JSON.stringify({ id: 'abc', title: 'Collection A - Updated' }));

    const { result } = renderHook(() => useCollection('abc'), { wrapper });
    await waitFor(() =>
      expect(result.current.collection).toEqual({ id: 'abc', title: 'Collection A' })
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() =>
      expect(result.current.collection).toEqual({ id: 'abc', title: 'Collection A - Updated' })
    );
  });
});
