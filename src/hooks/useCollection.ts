import { useMemo, useState, useEffect } from 'react';

import type { ApiError, LoadingState } from '../types';
import type { Collection } from '../types/stac';
import useCollections from './useCollections';

type StacCollectionHook = {
  collection?: Collection,
  state: LoadingState,
  error?: ApiError
};

function useCollection(collectionId: string): StacCollectionHook {
  const { collections, state, error: requestError } = useCollections();
  const [ error, setError ] = useState<ApiError>();

  useEffect(() => {
    setError(requestError);
  }, [requestError]);

  const collection = useMemo(
    () => {
      const coll = collections?.collections.find(({ id }) => id === collectionId);
      if (!coll) {
        setError({
          status: 404,
          statusText: 'Not found',
          detail: 'Collection does not exist'
        });
      }
      return coll;
    },
    [collectionId, collections]
  );

  return {
    collection,
    state,
    error
  };
}

export default useCollection;
