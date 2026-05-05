import { useQuery } from '@tanstack/react-query';
import type { StacHook, StacRefetchFn } from '../types';
import type { StacItem } from '../types/stac';
import { useStacApiContext } from '../context/useStacApiContext';
import { handleStacResponse } from '../utils/handleStacResponse';
import { generateItemQueryKey } from '../utils/queryKeys';
import { ApiError } from '../utils/ApiError';

interface StacItemHook extends StacHook {
  item?: StacItem;
  refetch: StacRefetchFn<StacItem>;
}

function useItem(url: string): StacItemHook {
  const { stacApi } = useStacApiContext();

  const fetchItem = async (): Promise<StacItem> => {
    if (!stacApi) throw new Error('No STAC API configured');
    const response: Response = await stacApi.get(url);
    return handleStacResponse<StacItem>(response);
  };

  const {
    data: item,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<StacItem, ApiError>({
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
