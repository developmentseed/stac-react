import React, { useMemo } from 'react';
import { StacApiContext } from './context';
import { GenericObject } from '../types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import useStacApi from '../hooks/useStacApi';
import type { OptionsGetter } from '../stac-api';

type StacApiProviderType = {
  apiUrl: string;
  children: React.ReactNode;
  /**
   * Static options applied to every request, or a function invoked
   * per-request that returns options. Use the function form when values
   * (e.g. an auth header) must update across renders without rebuilding
   * the underlying StacApi instance. See {@link OptionsGetter}.
   */
  options?: GenericObject | OptionsGetter;
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
}: Omit<StacApiProviderType, 'queryClient'>) {
  const { stacApi } = useStacApi(apiUrl, options);

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
      <StacApiProviderInner apiUrl={apiUrl} options={options}>
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
