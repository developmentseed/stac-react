import { useQuery, type QueryObserverResult } from '@tanstack/react-query';
import { Item } from '../types/stac';
import { type ApiErrorType } from '../types';
import { useStacApiContext } from '../context/useStacApiContext';
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

  const {
    data: item,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<Item, ApiErrorType>({
    queryKey: generateItemQueryKey(url),
    queryFn: () => stacApi!.get<Item>(url),
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
