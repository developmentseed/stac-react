import { useMemo } from 'react';

import type { ApiError, LoadingState } from '../types';
import type { Collection } from '../types/stac';
import useCollections from './useCollections';

type StacCollectionHook = {
  collection?: Collection;
  state: LoadingState;
  error?: ApiError;
  reload: () => void;
};

function useCollection(collectionId: string): StacCollectionHook {
  const { collections, state, error: requestError, reload } = useCollections();

  const collection = useMemo(() => {
    return collections?.collections.find(({ id }) => id === collectionId);
  }, [collectionId, collections]);

  // Determine error: prefer requestError, else local 404 if collection not found
  const error: ApiError | undefined = requestError
    ? requestError
    : !collection && collections
      ? {
          status: 404,
          statusText: 'Not found',
          detail: 'Collection does not exist',
        }
      : undefined;

  return {
    collection,
    state,
    error,
    reload,
  };
}

export default useCollection;
