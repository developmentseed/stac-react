import { useQuery } from '@tanstack/react-query';

import { useStacApiContext } from '../context/useStacApiContext';
import type { StacHook } from '../types';
import type { SearchPayload, SearchResponse } from '../types/stac';
import { handleStacResponse } from '../utils/handleStacResponse';
import { ApiError } from '../utils/ApiError';

interface StacQueryHook extends StacHook {
  results?: SearchResponse | undefined;
}

/**
 * Declarative STAC search hook that executes a search query whenever the
 * parameters change. Unlike `useStacSearch`, there is no imperative `submit()`
 * call — the query runs automatically when `stacApi` is available.
 *
 * @param payload - Search parameters (collections, dateRange, bbox, ids, sortby)
 * @returns `{ results, isLoading, isFetching, error }`
 */
function useStacQuery(payload: SearchPayload): StacQueryHook {
  const { stacApi } = useStacApiContext();

  const queryFn = async () => {
    if (!stacApi) throw new Error('No STAC API configured');
    const response = await stacApi.search(payload);
    return handleStacResponse<SearchResponse>(response);
  };

  const {
    data: results,
    error,
    isLoading,
    isFetching,
  } = useQuery<SearchResponse, ApiError>({
    queryKey: ['stacSearch', 'query', payload],
    queryFn,
    enabled: !!stacApi,
    retry: false,
  });

  return {
    results,
    isLoading,
    isFetching,
    error,
  };
}

// biome-ignore lint/style/noDefaultExport: This hook is intended to be the default export
export default useStacQuery;
