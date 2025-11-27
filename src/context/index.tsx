import React, { useMemo, useState, useCallback, useContext } from 'react';
import { StacApiContext } from './context';
import type { CollectionsResponse, Item } from '../types/stac';
import { GenericObject } from '../types';
import { QueryClient, QueryClientProvider, QueryClientContext } from '@tanstack/react-query';

import useStacApi from '../hooks/useStacApi';

type StacApiProviderType = {
  apiUrl: string;
  children: React.ReactNode;
  options?: GenericObject;
  enableDevTools?: boolean;
};

function StacApiProviderInner({
  children,
  apiUrl,
  options,
}: Omit<StacApiProviderType, 'enableDevTools'>) {
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
  enableDevTools,
}: StacApiProviderType) {
  const existingClient = useContext(QueryClientContext);
  const defaultClient = useMemo(() => new QueryClient(), []);

  const client = existingClient ?? defaultClient;

  // Setup DevTools once when component mounts or enableDevTools changes
  useMemo(() => {
    if (enableDevTools && typeof window !== 'undefined') {
      window.__TANSTACK_QUERY_CLIENT__ = client;
    }
  }, [client, enableDevTools]);

  if (existingClient) {
    return (
      <StacApiProviderInner apiUrl={apiUrl} options={options}>
        {children}
      </StacApiProviderInner>
    );
  }

  return (
    <QueryClientProvider client={defaultClient}>
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
