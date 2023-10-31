import { useCallback, useEffect, useState, useMemo } from 'react';
import type { LoadingState } from '../types';
import type { CollectionsResponse } from '../types/stac';
import debounce from '../utils/debounce';
import { useStacApiContext } from '../context';

type StacCollectionsHook = {
  collections?: CollectionsResponse,
  reload: () => void,
  state: LoadingState
};

function useCollections(): StacCollectionsHook {
  const { stacApi, collections, setCollections } = useStacApiContext();
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
    [setCollections, stacApi]
  );
  const getCollections = useMemo(() => debounce(_getCollections), [_getCollections]);

  useEffect(
    () => {
      if (stacApi && !collections) {
        getCollections();
      }
    },
    [getCollections, stacApi, collections]
  );

  return {
    collections,
    reload: getCollections,
    state
  };
}

export default useCollections;
