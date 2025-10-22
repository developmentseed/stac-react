import React, { useMemo, useState, useCallback } from "react";
import { StacApiContext } from "./context";
import type { CollectionsResponse, Item } from "../types/stac";
import { GenericObject } from '../types';

import useStacApi from "../hooks/useStacApi";

type StacApiProviderType = {
  apiUrl: string;
  children: React.ReactNode;
  options?: GenericObject;
}

export function StacApiProvider({ children, apiUrl, options }: StacApiProviderType) {
  const { stacApi } = useStacApi(apiUrl, options);
  const [ collections, setCollections ] = useState<CollectionsResponse>();
  const [ items, setItems ] = useState(new Map<string, Item>());

  const getItem = useCallback((id: string) => items.get(id), [items]);

  const addItem = useCallback((itemPath: string, item: Item) => {
      setItems(new Map(items.set(itemPath, item)));
  }, [items]);

  const deleteItem = useCallback((itemPath: string) => {
      const tempItems = new Map(items);
      items.delete(itemPath);
      setItems(tempItems);
  }, [items]);

  const contextValue = useMemo(() => ({
      stacApi,
      collections,
      setCollections,
      getItem,
      addItem,
    deleteItem
  }), [addItem, collections, deleteItem, getItem, stacApi]);

  return (
    <StacApiContext.Provider value={contextValue}>
      { children }
    </StacApiContext.Provider>
  );
}
