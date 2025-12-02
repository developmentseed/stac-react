import { useQuery, type QueryObserverResult } from '@tanstack/react-query';
import { type ApiErrorType } from '../types';
import type { CollectionsResponse } from '../types/stac';
import { generateCollectionsQueryKey } from '../utils/queryKeys';
import { useStacApiContext } from '../context/useStacApiContext';

type StacCollectionsHook = {
  collections?: CollectionsResponse;
  refetch: () => Promise<QueryObserverResult<CollectionsResponse, ApiErrorType>>;
  isLoading: boolean;
  isFetching: boolean;
  error?: ApiErrorType;
};

function useCollections(): StacCollectionsHook {
  const { stacApi } = useStacApiContext();

  const {
    data: collections,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<CollectionsResponse, ApiErrorType>({
    queryKey: generateCollectionsQueryKey(),
    queryFn: () => stacApi!.getCollections(),
    enabled: !!stacApi,
    retry: false,
  });

  return {
    collections,
    refetch,
    isLoading,
    isFetching,
    error: error as ApiErrorType,
  };
}

export default useCollections;
