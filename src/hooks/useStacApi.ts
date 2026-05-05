import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import StacApi, { AuthHeadersGetter, SearchMode } from '../stac-api';
import { Link } from '../types/stac';
import { GenericObject } from '../types';
import { generateStacApiQueryKey } from '../utils/queryKeys';
import { handleStacResponse } from '../utils/handleStacResponse';

type StacApiHook = {
  stacApi?: StacApi;
  isLoading: boolean;
  isError: boolean;
};

function useStacApi(
  url: string,
  options?: GenericObject,
  getAuthHeaders?: AuthHeadersGetter,
): StacApiHook {
  // Hold the latest getter in a ref so the StacApi instance can call back
  // into a stable closure that always reads fresh values, without forcing
  // a new query (and another landing-page probe) on each token change.
  const getAuthHeadersRef = useRef<AuthHeadersGetter | undefined>(getAuthHeaders);
  useEffect(() => {
    getAuthHeadersRef.current = getAuthHeaders;
  }, [getAuthHeaders]);

  const { data, isSuccess, isLoading, isError } = useQuery({
    // getAuthHeaders is intentionally NOT part of the key — its identity
    // changes across renders and we don't want to rebuild StacApi (which
    // would re-fire the landing-page probe). Strict-Mode double-mounts
    // are safe because staleTime: Infinity keeps the cached instance.
    queryKey: generateStacApiQueryKey(url, options),
    queryFn: async () => {
      const response = await fetch(url, {
        headers: {
          ...options?.headers,
        },
      });
      const stacData = await handleStacResponse<{ links?: Link[] }>(response);

      const doesPost = stacData.links?.find(
        ({ rel, method }: Link) => rel === 'search' && method === 'POST'
      );

      return new StacApi({
        baseUrl: response.url,
        searchMode: doesPost ? SearchMode.POST : SearchMode.GET,
        options,
        getAuthHeaders: () => getAuthHeadersRef.current?.(),
      });
    },
    staleTime: Infinity,
  });
  return { stacApi: isSuccess ? data : undefined, isLoading, isError };
}

export default useStacApi;
