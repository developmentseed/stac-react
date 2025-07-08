import fetch from 'jest-fetch-mock';
import { renderHook } from '@testing-library/react-hooks';
import useCollections from './useCollections';
import wrapper from './wrapper';

describe('useStacApi', () => {
  beforeEach(() => fetch.resetMocks());
  it('initilises StacAPI', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), {
        url: 'https://fake-stac-api.net'
      })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { waitForNextUpdate } = renderHook(() => useCollections(), {
      wrapper
    });
    await waitForNextUpdate();
    await waitForNextUpdate();
    expect(fetch.mock.calls[1][0]).toEqual(
      'https://fake-stac-api.net/collections?limit=10'
    );
  });

  it('initilises StacAPI with redirect URL', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), {
        url: 'https://fake-stac-api.net/redirect/'
      })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { waitForNextUpdate } = renderHook(() => useCollections(), {
      wrapper
    });
    await waitForNextUpdate();
    await waitForNextUpdate();
    expect(fetch.mock.calls[1][0]).toEqual(
      'https://fake-stac-api.net/redirect/collections?limit=10'
    );
  });
});
