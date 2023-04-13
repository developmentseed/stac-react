import fetch from 'jest-fetch-mock';
import { renderHook } from '@testing-library/react-hooks';
import useStacApi from './useStacApi';
import useCollections from './useCollections';

describe('useStacApi', () => {
  beforeEach(() => fetch.resetMocks());

  it('initilises StacAPI', async () => {
    fetch.mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' });
    const { result: stacApiResult, waitForNextUpdate: waitForApiUpdate } = renderHook(
      () => useStacApi('https://fake-stac-api.net')
    );
    await waitForApiUpdate();

    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    const { waitForNextUpdate: waitForCollectionsUpdate } = renderHook(
      () => useCollections(stacApiResult.current.stacApi)
    );
    await waitForCollectionsUpdate();
    expect(fetch.mock.calls[1][0]).toEqual('https://fake-stac-api.net/collections');
  });

  it('initilises StacAPI with redirect URL', async () => {
    fetch.mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net/redirect/' });
    const { result: stacApiResult, waitForNextUpdate: waitForApiUpdate } = renderHook(
      () => useStacApi('https://fake-stac-api.net')
    );
    await waitForApiUpdate();

    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    const { waitForNextUpdate: waitForCollectionsUpdate } = renderHook(
      () => useCollections(stacApiResult.current.stacApi)
    );
    await waitForCollectionsUpdate();
    expect(fetch.mock.calls[1][0]).toEqual('https://fake-stac-api.net/redirect/collections');
  });
});
