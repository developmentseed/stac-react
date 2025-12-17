import { useQuery } from '@tanstack/react-query';
import type { StacHook, StacRefetchFn } from '../types';
import type { CollectionsResponse } from '../types/stac';
import { handleStacResponse } from '../utils/handleStacResponse';
import { generateCollectionsQueryKey } from '../utils/queryKeys';
import { useStacApiContext } from '../context/useStacApiContext';
import { ApiError } from '../utils/ApiError';

interface StacCollectionsHook extends StacHook {
  collections?: CollectionsResponse;
  refetch: StacRefetchFn<CollectionsResponse>;
}

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
  } = useQuery<CollectionsResponse, ApiError>({
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
    error,
  };
}

export default useCollections;
