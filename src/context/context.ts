import { createContext } from 'react';
import type { CollectionsResponse, Item } from '../types/stac';

export type StacApiContextType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stacApi?: any;
  collections?: CollectionsResponse;
  setCollections: (collections?: CollectionsResponse) => void;
  getItem: (id: string) => Item | undefined;
  addItem: (id: string, item: Item) => void;
  deleteItem: (id: string) => void;
};

export const StacApiContext = createContext<StacApiContextType>({} as StacApiContextType);
