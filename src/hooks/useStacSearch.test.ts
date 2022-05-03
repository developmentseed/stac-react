import fetch from 'jest-fetch-mock';
import { renderHook, act } from '@testing-library/react-hooks';
import useStacSearch from './useStacSearch';

function parseRequestPayload(mockApiCall?: RequestInit) {
  if (!mockApiCall) {
    throw new Error('Unable to parse request payload. The mock API call is undefined.');
  }
  return JSON.parse(mockApiCall.body as string);
}

describe('useStacSearch', () => {
  it('includes Bbox in search', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useStacSearch('https://fake-stac-api.net')
    );

    act(() => result.current.setBbox([-0.59, 51.24, 0.30, 51.74]));
    act(() => result.current.submit());
    await waitForNextUpdate();

    const postPayload = parseRequestPayload(fetch.mock.calls[0][1]);
    expect(postPayload).toEqual({ bbox: [-0.59, 51.24, 0.30, 51.74] });
    expect(result.current.results).toEqual({ data: '12345' });
  });
});