import { useCallback, useEffect, useState, useMemo } from 'react';
import StacApi from '../stac-api';
import type { LoadingState } from '../types';
import type { CollectionsResponse } from '../types/stac';
import debounce from '../utils/debounce';

type StacCollectionsHook = {
  collections?: CollectionsResponse,
  reload: () => void,
  state: LoadingState
};

function useCollections(stacApi?: StacApi): StacCollectionsHook {
  const [ collections, setCollections ] = useState<CollectionsResponse>();
  const [ state, setState ] = useState<LoadingState>('IDLE');

  const _getCollections = useCallback(
    () => {
      if (stacApi) {
        setState('LOADING');
        setCollections(undefined);

        stacApi.getCollections()
          .then(response => response.json())
          .then(setCollections)
          .finally(() => setState('IDLE'));
      }
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
