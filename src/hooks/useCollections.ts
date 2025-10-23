import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ApiError, type LoadingState } from '../types';
import type { CollectionsResponse } from '../types/stac';
import debounce from '../utils/debounce';
import { useStacApiContext } from '../context/useStacApiContext';

type StacCollectionsHook = {
  collections?: CollectionsResponse;
  reload: () => void;
  state: LoadingState;
  error?: ApiError;
};

function useCollections(): StacCollectionsHook {
  const { stacApi, setCollections } = useStacApiContext();
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

      const err = Object.assign(new Error(response.statusText), {
        status: response.status,
        statusText: response.statusText,
        detail,
      });
      throw err;
    }
    return await response.json();
  };

  const {
    data: collections,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<CollectionsResponse, ApiError>({
    queryKey: ['collections'],
    queryFn: fetchCollections,
    enabled: !!stacApi,
    retry: false,
  });

  // Sync collections with context
  // This preserves the previous logic for consumers and tests
  useEffect(() => {
    if (collections) {
      setCollections(collections);
    } else if (error) {
      setCollections(undefined);
    }
  }, [collections, error, setCollections]);

  const reload = useMemo(() => debounce(refetch), [refetch]);

  useEffect(() => {
    // Map TanStack Query loading states to previous LoadingState type
    if (isLoading || isFetching) {
      setState('LOADING');
    } else {
      setState('IDLE');
    }
  }, [isLoading, isFetching]);

  return {
    collections,
    reload,
    state,
    error: error as ApiError,
  };
}

export default useCollections;
