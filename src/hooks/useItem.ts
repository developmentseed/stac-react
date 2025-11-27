import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Item } from '../types/stac';
import { type ApiErrorType, type LoadingState } from '../types';
import { useStacApiContext } from '../context/useStacApiContext';
import { ApiError } from '../utils/ApiError';
import { generateItemQueryKey } from '../utils/queryKeys';

type ItemHook = {
  item?: Item;
  state: LoadingState;
  error?: ApiErrorType;
  reload: () => void;
};

function useItem(url: string): ItemHook {
  const { stacApi } = useStacApiContext();
  const [state, setState] = useState<LoadingState>('IDLE');

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

      throw new ApiError(response.statusText, response.status, detail);
    }
    return await response.json();
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

  useEffect(() => {
    if (isLoading || isFetching) {
      setState('LOADING');
    } else {
      setState('IDLE');
    }
  }, [isLoading, isFetching]);

  return {
    item,
    state,
    error: error as ApiErrorType,
    reload: refetch as () => void,
  };
}

export default useItem;
