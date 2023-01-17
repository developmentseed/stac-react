import fetch from 'jest-fetch-mock';
import { renderHook, act } from '@testing-library/react-hooks';
import useCollections from './useCollections';
import StacApi from '../stac-api';

describe('useCollections', () => {
  const stacApi = new StacApi('https://fake-stac-api.net');
  beforeEach(() => fetch.resetMocks());

  it('queries collections', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useCollections(stacApi)
    );
    await waitForNextUpdate();
    expect(fetch.mock.calls[0][0]).toEqual('https://fake-stac-api.net/collections');
    expect(result.current.collections).toEqual({ data: '12345' });
    expect(result.current.state).toEqual('IDLE');
  });

  it('reloads collections', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: 'original' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useCollections(stacApi)
    );
    await waitForNextUpdate();
    expect(result.current.collections).toEqual({ data: 'original' });
    
    expect(result.current.state).toEqual('IDLE');
    fetch.mockResponseOnce(JSON.stringify({ data: 'reloaded' }));
    act(() => result.current.reload());
    await waitForNextUpdate();
    expect(result.current.collections).toEqual({ data: 'reloaded' });
  });
});
