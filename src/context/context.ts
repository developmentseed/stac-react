import { createContext } from 'react';

export type StacApiContextType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stacApi?: any;
};

export const StacApiContext = createContext<StacApiContextType>({} as StacApiContextType);
