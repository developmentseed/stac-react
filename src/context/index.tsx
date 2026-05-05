import React, { useMemo } from 'react';
import { StacApiContext } from './context';
import { GenericObject } from '../types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import useStacApi from '../hooks/useStacApi';
import type { AuthHeadersGetter } from '../stac-api';

type StacApiProviderType = {
  apiUrl: string;
  children: React.ReactNode;
  options?: GenericObject;
  /**
   * Optional callback invoked per-request to retrieve auth headers (e.g.
   * `{ Authorization: 'Bearer ...' }`). When provided, headers are merged
   * into in-domain requests only — the bearer is never sent to URLs
   * outside `apiUrl`'s origin / path. The callback identity may change
   * across renders without rebuilding the underlying StacApi instance.
   * See {@link AuthHeadersGetter} for an OIDC-refresh example.
   */
  getAuthHeaders?: AuthHeadersGetter;
  queryClient?: QueryClient;
  enableDevTools?: boolean;
};

/**
 * Inner component that must render inside QueryClientProvider.
 * Separated because useStacApi() calls useQuery from TanStack Query,
 * which requires QueryClient context to be available.
 */
function StacApiProviderInner({
  children,
  apiUrl,
  options,
  getAuthHeaders,
}: Omit<StacApiProviderType, 'queryClient'>) {
  const { stacApi } = useStacApi(apiUrl, options, getAuthHeaders);

  const contextValue = useMemo(
    () => ({
      stacApi,
    }),
    [stacApi]
  );

  return <StacApiContext.Provider value={contextValue}>{children}</StacApiContext.Provider>;
}

export function StacApiProvider({
  children,
  apiUrl,
  options,
  getAuthHeaders,
  queryClient,
  enableDevTools,
}: StacApiProviderType) {
  const defaultClient = useMemo(() => new QueryClient(), []);
  const client: QueryClient = queryClient ?? defaultClient;

  if (enableDevTools && typeof window !== 'undefined') {
    // Connect TanStack Query DevTools (browser extension)
    window.__TANSTACK_QUERY_CLIENT__ = client;
  }

  return (
    <QueryClientProvider client={client}>
      <StacApiProviderInner apiUrl={apiUrl} options={options} getAuthHeaders={getAuthHeaders}>
        {children}
      </StacApiProviderInner>
    </QueryClientProvider>
  );
}

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__?: import('@tanstack/query-core').QueryClient;
  }
}
