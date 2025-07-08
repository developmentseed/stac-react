import { useState, useEffect, useCallback } from 'react';

import type { ApiError, LoadingState } from '../types';
import type { Collection } from '../types/stac';
import { useStacApiContext } from '../context';

type StacCollectionHook = {
  collection?: Collection;
  state: LoadingState;
  error?: ApiError;
  reload: () => void;
};

function useCollection(collectionId: string): StacCollectionHook {
  if (!collectionId) {
    throw new Error('Collection ID is required');
  }

  const { stacApi, collections } = useStacApiContext();

  const [collection, setCollection] = useState<Collection>();
  const [state, setState] = useState<LoadingState>('IDLE');
  const [error, setError] = useState<ApiError>();

  const load = useCallback(
    (id: string) => {
      if (stacApi) {
        setError(undefined);
        setState('LOADING');
        stacApi
          .getCollection(id)
          .then(async (res) => {
            const data: Collection = await res.json();
            setCollection(data);
          })
          .catch((err: ApiError) => {
            setError(err);
          })
          .finally(() => {
            setState('IDLE');
          });
      }
    },
    [stacApi]
  );

  useEffect(() => {
    setState('LOADING');
    // Check if the collection is already in the collections list.
    const coll = collections?.collections.find(({ id }) => id === collectionId);
    if (coll) {
      setCollection(coll);
      setState('IDLE');
      return;
    }

    // If not, request the collection directly from the API.
    load(collectionId);
  }, [collectionId, collections, load]);

  return {
    collection,
    state,
    error,
    reload: useCallback(() => {
      load(collectionId);
    }, [collectionId, load])
  };
}

export default useCollection;
