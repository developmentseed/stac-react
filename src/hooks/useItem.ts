import { useQuery, type QueryObserverResult } from '@tanstack/react-query';
import type { Item } from '../types/stac';
import { useStacApiContext } from '../context/useStacApiContext';
import { handleStacResponse } from '../utils/handleStacResponse';
import { generateItemQueryKey } from '../utils/queryKeys';
import { ApiError } from '../utils/ApiError';

type ItemHook = {
  item?: Item;
  isLoading: boolean;
  isFetching: boolean;
  error: ApiError | null;
  refetch: () => Promise<QueryObserverResult<Item, ApiError>>;
};

function useItem(url: string): ItemHook {
  const { stacApi } = useStacApiContext();

  const fetchItem = async (): Promise<Item> => {
    if (!stacApi) throw new Error('No STAC API configured');
    const response: Response = await stacApi.get(url);
    return handleStacResponse<Item>(response);
  };

  const {
    data: item,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<Item, ApiError>({
    queryKey: generateItemQueryKey(url),
    queryFn: fetchItem,
    enabled: !!stacApi,
    retry: false,
  });

  return {
    item,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}

export default useItem;
