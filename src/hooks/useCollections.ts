import { useQuery, type QueryObserverResult } from '@tanstack/react-query';
import { type ApiErrorType } from '../types';
import type { CollectionsResponse } from '../types/stac';
import { handleStacResponse } from '../utils/handleStacResponse';
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

  const fetchCollections = async (): Promise<CollectionsResponse> => {
    if (!stacApi) throw new Error('No STAC API configured');
    const response: Response = await stacApi.getCollections();
    return handleStacResponse<CollectionsResponse>(response);
  };

  const {
    data: collections,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<CollectionsResponse, ApiErrorType>({
    queryKey: generateCollectionsQueryKey(),
    queryFn: fetchCollections,
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
