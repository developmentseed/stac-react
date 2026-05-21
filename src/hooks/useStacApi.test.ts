import React from 'react';
import fetch from 'jest-fetch-mock';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useCollections from './useCollections';
import useStacApi from './useStacApi';
import wrapper from './wrapper';

describe('useStacApi', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('initializes StacAPI', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ data: '12345' }));

    renderHook(() => useCollections(), { wrapper });
    await waitFor(() =>
      expect(fetch.mock.calls[1][0]).toEqual('https://fake-stac-api.net/collections')
    );
  });

  it('initializes StacAPI with redirect URL', async () => {
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

  it('does not refetch when options change', async () => {
    fetch.mockResponse(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const customWrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const initialProps: { options: Record<string, unknown> } = {
      options: { headers: { Authorization: 'Bearer token1' } },
    };
    const { rerender } = renderHook(
      ({ options }: { options: Record<string, unknown> }) =>
        useStacApi('https://fake-stac-api.net', options),
      { wrapper: customWrapper, initialProps }
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Re-render with a new options reference whose contents also differ.
    rerender({ options: { headers: { Authorization: 'Bearer token2' } } });
    // Re-render with a completely different options shape.
    rerender({ options: { foo: 'bar' } });
    // Re-render with a fresh reference but equivalent contents to the prior call.
    rerender({ options: { foo: 'bar' } });

    // Yield to allow any pending refetch to fire before asserting.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('refetches when url changes', async () => {
    fetch.mockResponse(JSON.stringify({ links: [] }));

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const customWrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { rerender } = renderHook(({ url }: { url: string }) => useStacApi(url), {
      wrapper: customWrapper,
      initialProps: { url: 'https://fake-stac-api.net/a' },
    });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch.mock.calls[0][0]).toEqual('https://fake-stac-api.net/a');

    rerender({ url: 'https://fake-stac-api.net/b' });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(fetch.mock.calls[1][0]).toEqual('https://fake-stac-api.net/b');
  });
});
