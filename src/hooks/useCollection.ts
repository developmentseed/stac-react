import { useQuery, type QueryObserverResult } from '@tanstack/react-query';
import type { ApiErrorType } from '../types';
import type { Collection } from '../types/stac';
import { handleStacResponse } from '../utils/handleStacResponse';
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
  } = useQuery<Collection, ApiErrorType>({
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
    error: error as ApiErrorType,
  };
}

export default useCollection;
