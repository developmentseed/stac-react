import { useQuery } from '@tanstack/react-query';
import type { StacHook, StacRefetchFn, ApiErrorType } from '../types';
import type { Item } from '../types/stac';
import { useStacApiContext } from '../context/useStacApiContext';
import { handleStacResponse } from '../utils/handleStacResponse';
import { generateItemQueryKey } from '../utils/queryKeys';

interface StacItemHook extends StacHook {
  item?: Item;
  refetch: StacRefetchFn<Item>;
}

function useItem(url: string): StacItemHook {
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
