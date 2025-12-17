import { useQuery } from '@tanstack/react-query';
import type { StacHook, StacRefetchFn } from '../types';
import type { Collection } from '../types/stac';
import { handleStacResponse } from '../utils/handleStacResponse';
import { generateCollectionQueryKey } from '../utils/queryKeys';
import { useStacApiContext } from '../context/useStacApiContext';
import { ApiError } from '../utils/ApiError';

interface StacCollectionHook extends StacHook {
  collection?: Collection;
  refetch: StacRefetchFn<Collection>;
}

function useCollection(collectionId: string): StacCollectionHook {
  const { stacApi } = useStacApiContext();

  const fetchCollection = async (): Promise<Collection> => {
    if (!stacApi) throw new Error('No STAC API configured');
    const response: Response = await stacApi.getCollection(collectionId);
    return handleStacResponse<Collection>(response);
  };

  const {
    data: collection,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<Collection, ApiError>({
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
