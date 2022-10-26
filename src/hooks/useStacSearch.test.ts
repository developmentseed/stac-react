import fetch from 'jest-fetch-mock';
import { renderHook, act } from '@testing-library/react-hooks';
import useStacSearch from './useStacSearch';
import StacApi from '../stac-api';

function parseRequestPayload(mockApiCall?: RequestInit) {
  if (!mockApiCall) {
    throw new Error('Unable to parse request payload. The mock API call is undefined.');
  }
  return JSON.parse(mockApiCall.body as string);
}

describe('useStacSearch', () => {
  const stacApi = new StacApi('https://fake-stac-api.net');
  beforeEach(() => fetch.resetMocks());

  it('includes Bbox in search', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(stacApi)
    );

    act(() => result.current.setBbox([-0.59, 51.24, 0.30, 51.74]));
    act(() => result.current.submit());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[0][1]);
    expect(postPayload).toEqual({ bbox: [-0.59, 51.24, 0.30, 51.74] });
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes Bbox in search in correct order', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(stacApi)
    );

    act(() => result.current.setBbox([0.30, 51.74, -0.59, 51.24]));
    act(() => result.current.submit());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[0][1]);
    expect(postPayload).toEqual({ bbox: [-0.59, 51.24, 0.30, 51.74] });
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes Collections in search', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(stacApi)
    );

    act(() => result.current.setCollections(['wildfire', 'surface_temp']));
    act(() => result.current.submit());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[0][1]);
    expect(postPayload).toEqual({ collections: ['wildfire', 'surface_temp'] });
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes date range in search', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(stacApi)
    );

    act(() => result.current.setDateRangeFrom('2022-01-17'));
    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[0][1]);
    expect(postPayload).toEqual({ datetime: '2022-01-17/2022-05-17' });
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes open date range in search (no to-date)', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(stacApi)
    );

    act(() => result.current.setDateRangeFrom('2022-01-17'));
    act(() => result.current.submit());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[0][1]);
    expect(postPayload).toEqual({ datetime: '2022-01-17/..' });
    expect(result.current.results).toEqual({ data: '12345' });
  });

  it('includes open date range in search (no from-date)', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch(stacApi)
    );

    act(() => result.current.setDateRangeTo('2022-05-17'));
    act(() => result.current.submit());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[0][1]);
    expect(postPayload).toEqual({ datetime: '../2022-05-17' });
    expect(result.current.results).toEqual({ data: '12345' });
  });
});
