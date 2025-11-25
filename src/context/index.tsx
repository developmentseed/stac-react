import React, { useMemo, useState, useCallback } from 'react';
import { StacApiContext } from './context';
import type { CollectionsResponse, Item } from '../types/stac';
import { GenericObject } from '../types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import useStacApi from '../hooks/useStacApi';

type StacApiProviderType = {
  apiUrl: string;
  children: React.ReactNode;
  options?: GenericObject;
  queryClient?: QueryClient;
  enableDevTools?: boolean;
};

function StacApiProviderInner({
  children,
  apiUrl,
  options,
}: Omit<StacApiProviderType, 'queryClient'>) {
  const { stacApi } = useStacApi(apiUrl, options);
  const [collections, setCollections] = useState<CollectionsResponse>();
  const [items, setItems] = useState(new Map<string, Item>());

  const getItem = useCallback((id: string) => items.get(id), [items]);

  const addItem = useCallback(
    (itemPath: string, item: Item) => {
      setItems(new Map(items.set(itemPath, item)));
    },
    [items]
  );

  const deleteItem = useCallback(
    (itemPath: string) => {
      const tempItems = new Map(items);
      items.delete(itemPath);
      setItems(tempItems);
    },
    [items]
  );

  const contextValue = useMemo(
    () => ({
      stacApi,
      collections,
      setCollections,
      getItem,
      addItem,
      deleteItem,
    }),
    [addItem, collections, deleteItem, getItem, stacApi]
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
