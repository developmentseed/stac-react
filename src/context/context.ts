import { createContext } from 'react';
import StacApi from '../stac-api';

export type StacApiContextType = {
  stacApi?: StacApi;
};

export const StacApiContext = createContext<StacApiContextType>({} as StacApiContextType);
