import { useQuery, type QueryObserverResult } from '@tanstack/react-query';
import type { ApiErrorType } from '../types';
import type { Collection } from '../types/stac';
import { ApiError } from '../utils/ApiError';
import { generateCollectionQueryKey } from '../utils/queryKeys';
import { useStacApiContext } from '../context/useStacApiContext';

type StacCollectionHook = {
  collection?: Collection;
  isLoading: boolean;
  isFetching: boolean;
  error?: ApiErrorType;
  reload: () => Promise<QueryObserverResult<Collection, ApiErrorType>>;
};

function useCollection(collectionId: string): StacCollectionHook {
  const { stacApi } = useStacApiContext();

  const fetchCollection = async (): Promise<Collection> => {
    if (!stacApi) throw new Error('No STAC API configured');
    const response: Response = await stacApi.getCollection(collectionId);
    if (!response.ok) {
      let detail;
      try {
        detail = await response.json();
      } catch {
        detail = await response.text();
      }

      throw new ApiError(response.statusText, response.status, detail);
    }
    return await response.json();
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
    error: error as ApiErrorType,
    reload: refetch,
  };
}

export default useCollection;
