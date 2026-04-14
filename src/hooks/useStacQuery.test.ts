import fetch from 'jest-fetch-mock';
import { renderHook, waitFor } from '@testing-library/react';
import useStacQuery from './useStacQuery';
import wrapper from './wrapper';

const ROOT_POST = JSON.stringify({ links: [{ rel: 'search', method: 'POST' }] });
const ROOT_GET = JSON.stringify({ links: [] });

const makeFeatureCollection = (ids: string[]) =>
  JSON.stringify({
    type: 'FeatureCollection',
    features: ids.map((id) => ({ id })),
    links: [],
  });

describe('useStacQuery — API supports POST', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('automatically fetches results on mount', async () => {
    fetch
      .mockResponseOnce(ROOT_POST, { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(makeFeatureCollection(['item-1', 'item-2']));

    const { result } = renderHook(() => useStacQuery({ collections: ['sentinel-2-l2a'] }), {
      wrapper,
    });

    await waitFor(() =>
      expect(result.current.results).toMatchObject({
        type: 'FeatureCollection',
        features: [{ id: 'item-1' }, { id: 'item-2' }],
      })
    );
    expect(result.current.isLoading).toBe(false);
  });

  it('sends correct POST payload with collections', async () => {
    fetch
      .mockResponseOnce(ROOT_POST, { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(makeFeatureCollection([]));

    renderHook(() => useStacQuery({ collections: ['landsat-8-l1tp'] }), { wrapper });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const body = JSON.parse(fetch.mock.calls[1][1]?.body as string);
    expect(body).toMatchObject({ collections: ['landsat-8-l1tp'] });
  });

  it('sends correct POST payload with bbox', async () => {
    fetch
      .mockResponseOnce(ROOT_POST, { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(makeFeatureCollection([]));

    renderHook(() => useStacQuery({ bbox: [-0.59, 51.24, 0.3, 51.74] }), { wrapper });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const body = JSON.parse(fetch.mock.calls[1][1]?.body as string);
    expect(body).toMatchObject({ bbox: [-0.59, 51.24, 0.3, 51.74] });
  });

  it('sends correct POST payload with date range', async () => {
    fetch
      .mockResponseOnce(ROOT_POST, { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(makeFeatureCollection([]));

    renderHook(() => useStacQuery({ dateRange: { from: '2023-01-01', to: '2023-12-31' } }), {
      wrapper,
    });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const body = JSON.parse(fetch.mock.calls[1][1]?.body as string);
    expect(body).toMatchObject({
      datetime: '2023-01-01T00:00:00Z/2023-12-31T23:59:59Z',
    });
  });

  it('refetches when payload changes', async () => {
    fetch
      .mockResponseOnce(ROOT_POST, { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(makeFeatureCollection(['item-a']))
      .mockResponseOnce(makeFeatureCollection(['item-b']));

    const { result, rerender } = renderHook((payload) => useStacQuery(payload), {
      wrapper,
      initialProps: { collections: ['collection-a'] },
    });

    await waitFor(() => expect(result.current.results?.features[0]?.id).toBe('item-a'));

    rerender({ collections: ['collection-b'] });

    await waitFor(() => expect(result.current.results?.features[0]?.id).toBe('item-b'));
  });

  it('handles error with JSON response', async () => {
    fetch
      .mockResponseOnce(ROOT_POST, { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ error: 'Invalid query' }), {
        status: 400,
        statusText: 'Bad Request',
      });

    const { result } = renderHook(() => useStacQuery({ collections: ['sentinel-2-l2a'] }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error).toMatchObject({
      status: 400,
      message: 'Bad Request',
      detail: { error: 'Invalid query' },
    });
  });

  it('handles error with non-JSON response', async () => {
    fetch
      .mockResponseOnce(ROOT_POST, { url: 'https://fake-stac-api.net' })
      .mockResponseOnce('Internal Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

    const { result } = renderHook(() => useStacQuery({ collections: ['sentinel-2-l2a'] }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error).toMatchObject({
      status: 500,
      message: 'Internal Server Error',
      detail: 'Internal Server Error',
    });
  });
});

describe('useStacQuery — API supports GET', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('automatically fetches results using GET', async () => {
    fetch
      .mockResponseOnce(ROOT_GET, { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(makeFeatureCollection(['item-1']));

    const { result } = renderHook(() => useStacQuery({ collections: ['sentinel-2-l2a'] }), {
      wrapper,
    });

    await waitFor(() =>
      expect(result.current.results).toMatchObject({ type: 'FeatureCollection' })
    );
    expect(fetch.mock.calls[1][0]).toMatch(/https:\/\/fake-stac-api\.net\/search/);
  });
});
