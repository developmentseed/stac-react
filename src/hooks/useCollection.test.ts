import fetch from 'jest-fetch-mock';
import { renderHook, act, waitFor } from '@testing-library/react';
import useCollection from './useCollection';
import wrapper from './wrapper';

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
      expect(result.current.error).toEqual({
        status: 404,
        statusText: 'Not Found',
        detail: { error: 'Collection not found' },
      })
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
      expect(result.current.error).toEqual({
        status: 400,
        statusText: 'Bad Request',
        detail: { error: 'Wrong query' },
      })
    );
  });

  it('handles error with non-JSON response', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce('Wrong query', { status: 400, statusText: 'Bad Request' });

    const { result } = renderHook(() => useCollection('abc'), { wrapper });
    await waitFor(() =>
      expect(result.current.error).toEqual({
        status: 400,
        statusText: 'Bad Request',
        detail: 'Wrong query',
      })
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

    act(() => result.current.reload());

    await waitFor(() =>
      expect(result.current.collection).toEqual({ id: 'abc', title: 'Collection A - Updated' })
    );
  });
});
