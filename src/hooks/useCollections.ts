import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ApiErrorType, type LoadingState } from '../types';
import type { CollectionsResponse } from '../types/stac';
import debounce from '../utils/debounce';
import { ApiError } from '../utils/ApiError';
import { generateCollectionsQueryKey } from '../utils/queryKeys';
import { useStacApiContext } from '../context/useStacApiContext';

type StacCollectionsHook = {
  collections?: CollectionsResponse;
  reload: () => void;
  state: LoadingState;
  error?: ApiErrorType;
};

function useCollections(): StacCollectionsHook {
  const { stacApi } = useStacApiContext();
  const [state, setState] = useState<LoadingState>('IDLE');

  const fetchCollections = async (): Promise<CollectionsResponse> => {
    if (!stacApi) throw new Error('No STAC API configured');
    const response: Response = await stacApi.getCollections();
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
    data: collections,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<CollectionsResponse, ApiErrorType>({
    queryKey: generateCollectionsQueryKey(),
    queryFn: fetchCollections,
    enabled: !!stacApi,
    retry: false,
  });

  const reload = useMemo(() => debounce(refetch), [refetch]);

  useEffect(() => {
    if (!stacApi) {
      setState('IDLE');
    } else if (isLoading || isFetching) {
      setState('LOADING');
    } else {
      setState('IDLE');
    }
  }, [stacApi, isLoading, isFetching]);

  return {
    collections,
    reload,
    state,
    error: error as ApiErrorType,
  };
}

export default useCollections;
