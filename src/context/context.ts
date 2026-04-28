import { createContext } from 'react';
import type StacApi from '../stac-api';

export type StacApiContextType = {
  stacApi?: StacApi;
};

export const StacApiContext = createContext<StacApiContextType>({});
