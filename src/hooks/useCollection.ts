import { useMemo } from 'react';

import type { LoadingState } from '../types';
import type { Collection } from '../types/stac';
import useCollections from './useCollections';

type StacCollectionHook = {
  collection?: Collection,
  state: LoadingState
};

function useCollection(collectionId: string): StacCollectionHook {
  const { collections, state } = useCollections();

  const collection = useMemo(
    () => collections?.collections.find(({ id }) => id === collectionId),
    [collectionId, collections]
  );

  return {
    collection,
    state
  };
}

export default useCollection;
