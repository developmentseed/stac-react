import { useQuery } from '@tanstack/react-query';
import type { StacHook, StacRefetchFn } from '../types';
import type { StacCollection } from '../types/stac';
import { handleStacResponse } from '../utils/handleStacResponse';
import { generateCollectionQueryKey } from '../utils/queryKeys';
import { useStacApiContext } from '../context/useStacApiContext';
import { ApiError } from '../utils/ApiError';

interface StacCollectionHook extends StacHook {
  collection?: StacCollection;
  refetch: StacRefetchFn<StacCollection>;
}

function useCollection(collectionId: string): StacCollectionHook {
  const { stacApi } = useStacApiContext();

  const fetchCollection = async (): Promise<StacCollection> => {
    if (!stacApi) throw new Error('No STAC API configured');
    const response: Response = await stacApi.getCollection(collectionId);
    return handleStacResponse<StacCollection>(response);
  };

  const {
    data: collection,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<StacCollection, ApiError>({
    queryKey: generateCollectionQueryKey(collectionId),
    queryFn: fetchCollection,
    enabled: !!stacApi,
    retry: false,
  });

  return {
    collection,
    isLoading,
    isFetching,
    refetch,
    error,
  };
}

export default useCollection;
