import { useQuery, type QueryObserverResult } from '@tanstack/react-query';
import type { ApiErrorType } from '../types';
import type { Collection } from '../types/stac';
import { generateCollectionQueryKey } from '../utils/queryKeys';
import { useStacApiContext } from '../context/useStacApiContext';

type StacCollectionHook = {
  collection?: Collection;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<QueryObserverResult<Collection, ApiErrorType>>;
  error?: ApiErrorType;
};

function useCollection(collectionId: string): StacCollectionHook {
  const { stacApi } = useStacApiContext();

  const {
    data: collection,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<Collection, ApiErrorType>({
    queryKey: generateCollectionQueryKey(collectionId),
    queryFn: () => stacApi!.getCollection(collectionId),
    enabled: !!stacApi,
    retry: false,
  });

  return {
    collection,
    isLoading,
    isFetching,
    refetch,
    error: error as ApiErrorType,
  };
}

export default useCollection;
