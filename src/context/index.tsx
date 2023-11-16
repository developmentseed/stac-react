import React, { useMemo, useContext, useState } from 'react';
import { createContext } from 'react';

import StacApi from '../stac-api';
import useStacApi from '../hooks/useStacApi';
import type { CollectionsResponse } from '../types/stac';
import { GenericObject } from '../types';

type StacApiContextType = {
  stacApi?: StacApi;
  collections?: CollectionsResponse;
  setCollections: (collections?: CollectionsResponse) => void;
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

  const contextValue = useMemo(() => ({
    stacApi,
    collections,
    setCollections
  }), [collections, stacApi]);

  return (
    <StacApiContext.Provider value={contextValue}>
      { children }
    </StacApiContext.Provider>
  );
}

export function useStacApiContext() {
  const { stacApi, collections, setCollections } = useContext(StacApiContext);

  return {
    stacApi,
    collections,
    setCollections
  };
}