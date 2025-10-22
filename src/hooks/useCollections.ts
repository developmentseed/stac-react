import { useCallback, useEffect, useState, useMemo } from 'react';
import { type ApiError, type LoadingState } from '../types';
import type { CollectionsResponse } from '../types/stac';
import debounce from '../utils/debounce';
import { useStacApiContext } from '../context/useStacApiContext';

type StacCollectionsHook = {
  collections?: CollectionsResponse,
  reload: () => void,
  state: LoadingState
  error?: ApiError
};

function useCollections(): StacCollectionsHook {
  const { stacApi, collections, setCollections } = useStacApiContext();
  const [ state, setState ] = useState<LoadingState>('IDLE');
  const [ error, setError ] = useState<ApiError>();

  const _getCollections = useCallback(
    () => {
      if (stacApi) {
        setState('LOADING');

        stacApi.getCollections()
          .then((response: Response) => response.json())
          .then(setCollections)
          .catch((err: unknown) => {
            setError(err as ApiError);
            setCollections(undefined);
          })
          .finally(() => setState('IDLE'));
      }
    },
    [setCollections, stacApi]
  );
  const getCollections = useMemo(() => debounce(_getCollections), [_getCollections]);

  useEffect(
    () => {
      if (stacApi && !error && !collections) {
        getCollections();
      }
    },
    [getCollections, stacApi, collections, error]
  );

  return {
    collections,
    reload: getCollections,
    state,
    error,
  };
}

export default useCollections;
