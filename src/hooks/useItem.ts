import { useQuery, type QueryObserverResult } from '@tanstack/react-query';
import { Item } from '../types/stac';
import { type ApiErrorType } from '../types';
import { useStacApiContext } from '../context/useStacApiContext';
import { ApiError } from '../utils/ApiError';
import { generateItemQueryKey } from '../utils/queryKeys';

type ItemHook = {
  item?: Item;
  isLoading: boolean;
  isFetching: boolean;
  error?: ApiErrorType;
  refetch: () => Promise<QueryObserverResult<Item, ApiErrorType>>;
};

function useItem(url: string): ItemHook {
  const { stacApi } = useStacApiContext();

  const fetchItem = async (): Promise<Item> => {
    if (!stacApi) throw new Error('No STAC API configured');
    const response: Response = await stacApi.get(url);
    if (!response.ok) {
      let detail;
      try {
        detail = await response.json();
      } catch {
        detail = await response.text();
      }

      throw new ApiError(response.statusText, response.status, detail, response.url);
    }
    try {
      return await response.json();
    } catch (error) {
      throw new ApiError(
        'Invalid JSON Response',
        response.status,
        `Response is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
        response.url
      );
    }
  };

  const {
    data: item,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<Item, ApiErrorType>({
    queryKey: generateItemQueryKey(url),
    queryFn: fetchItem,
    enabled: !!stacApi,
    retry: false,
  });

  return {
    item,
    isLoading,
    isFetching,
    error: error as ApiErrorType,
    refetch,
  };
}

export default useItem;
