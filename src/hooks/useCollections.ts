import { useCallback, useEffect, useState } from 'react';
import StacApi from '../stac-api';
import type { GenericObject, LoadingState } from '../types';

type StacCollectionsHook = {
  collections?: GenericObject,
  reload: () => void,
  state: LoadingState
};

function useCollections(stacApi: StacApi): StacCollectionsHook {
  const [ collections, setCollections ] = useState<GenericObject>();
  const [ state, setState ] = useState<LoadingState>('IDLE');

  const getCollections = useCallback(
    () => {
      setState('LOADING');
      setCollections(undefined);

      stacApi.getCollections()
        .then(response => response.json())
        .then(setCollections)
        .finally(() => setState('IDLE'));
    },
    [stacApi]
  );

  useEffect(() => getCollections() ,[getCollections]);

  return {
    collections,
    reload: getCollections,
    state
  };
}

export default useCollections;
