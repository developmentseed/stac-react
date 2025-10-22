import fetch from 'jest-fetch-mock';
import { renderHook, waitFor } from '@testing-library/react';
import useCollections from './useCollections';
import wrapper from './wrapper';

describe('useStacApi', () => {
  beforeEach(() => fetch.resetMocks());
  it('initilises StacAPI', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    renderHook(() => useCollections(), { wrapper });
    await waitFor(() =>
      expect(fetch.mock.calls[1][0]).toEqual('https://fake-stac-api.net/collections')
    );
  });

  it('initilises StacAPI with redirect URL', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), {
        url: 'https://fake-stac-api.net/redirect/',
      })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    renderHook(() => useCollections(), { wrapper });
    await waitFor(() =>
      expect(fetch.mock.calls[1][0]).toEqual('https://fake-stac-api.net/redirect/collections')
    );
  });
});
