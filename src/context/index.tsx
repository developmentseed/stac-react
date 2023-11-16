import React, { useMemo, useContext, useState, useCallback } from 'react';
import { createContext } from 'react';

import StacApi from '../stac-api';
import useStacApi from '../hooks/useStacApi';
import type { CollectionsResponse, Item } from '../types/stac';
import { GenericObject } from '../types';

type StacApiContextType = {
  stacApi?: StacApi;
  collections?: CollectionsResponse;
  setCollections: (collections?: CollectionsResponse) => void;
  getItem: (id: string) => Item | undefined;
  addItem: (id: string, item: Item) => void;
}

type StacApiProviderType = {
  apiUrl: string;
  children: React.ReactNode;
  options?: GenericObject;
}

export const StacApiContext = createContext<StacApiContextType>({} as StacApiContextType);

export function StacApiProvider({ children, apiUrl, options }: StacApiProviderType) {
  const { stacApi } = useStacApi(apiUrl, options);
  const [ collections, setCollections ] = useState<CollectionsResponse>();
  const [ items, setItems ] = useState(new Map<string, Item>());

  const getItem = useCallback((id: string) => items.get(id), [items]);

  const addItem = useCallback((itemPath: string, item: Item) => {
    setItems(new Map(items.set(itemPath, item)));
  }, [items]);

  const contextValue = useMemo(() => ({
    stacApi,
    collections,
    setCollections,
    getItem,
    addItem
  }), [addItem, collections, getItem, stacApi]);

  return (
    <StacApiContext.Provider value={contextValue}>
      { children }
    </StacApiContext.Provider>
  );
}

export function useStacApiContext() {
  const {
    stacApi,
    collections,
    setCollections, 
    getItem,
    addItem
  } = useContext(StacApiContext);

  return {
    stacApi,
    collections,
    setCollections,
    getItem,
    addItem
  };
}
