import { useContext } from 'react';
import { StacApiContext } from './context';

export function useStacApiContext() {
  const { stacApi } = useContext(StacApiContext);

  return {
    stacApi,
  };
}
