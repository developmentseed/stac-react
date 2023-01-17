import { useCallback, useEffect, useState, useMemo } from 'react';
import StacApi from '../stac-api';
import type { GenericObject, LoadingState } from '../types';
import debounce from '../utils/debounce';

type StacCollectionsHook = {
  collections?: GenericObject,
  reload: () => void,
  state: LoadingState
};

function useCollections(stacApi: StacApi): StacCollectionsHook {
  const [ collections, setCollections ] = useState<GenericObject>();
  const [ state, setState ] = useState<LoadingState>('IDLE');

  const _getCollections = useCallback(
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
  const getCollections = useMemo(() => debounce(_getCollections), [_getCollections]);

  useEffect(() => getCollections(), [getCollections]);

  return {
    collections,
    reload: getCollections,
    state
  };
}

export default useCollections;
