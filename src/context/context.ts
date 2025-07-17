import { createContext } from 'react';
import StacApi from '../stac-api';
import { CollectionsResponse, Item } from '../types/stac';

type StacApiContextType = {
  stacApi?: StacApi;
  collections?: CollectionsResponse;
  setCollections: (collections?: CollectionsResponse) => void;
  getItem: (id: string) => Item | undefined;
  addItem: (id: string, item: Item) => void;
  deleteItem: (id: string) => void;
};

export const StacApiContext = createContext<StacApiContextType>(
  {} as StacApiContextType
);
