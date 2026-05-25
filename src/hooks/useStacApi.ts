import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import StacApi, { SearchMode } from '../stac-api';
import { Link } from '../types/stac';
import { GenericObject } from '../types';
import { generateStacApiQueryKey } from '../utils/queryKeys';
import { handleStacResponse } from '../utils/handleStacResponse';

type StacApiHook = {
  stacApi?: StacApi;
  isLoading: boolean;
  isError: boolean;
};

function useStacApi(url: string, options?: GenericObject): StacApiHook {
  const { data, isSuccess, isLoading, isError } = useQuery({
    queryKey: generateStacApiQueryKey(url),
    queryFn: async () => {
      // Inspect STAC API for supported search modes
      const response = await fetch(url, {
        headers: {
          ...options?.headers,
        },
      });
      const stacData = await handleStacResponse<{ links?: Link[] }>(response);

      const doesPost = stacData.links?.find(
        ({ rel, method }: Link) => rel === 'search' && method === 'POST'
      );

      return {
        mode: doesPost ? SearchMode.POST : SearchMode.GET,
        url: response.url,
      };
    },
    staleTime: Infinity,
  });

  return useMemo(() => {
    if (isSuccess) {
      return {
        stacApi: new StacApi(data.url, data.mode, options),
        isLoading,
        isError,
      };
    }

    return {
      stacApi: undefined,
      isLoading,
      isError,
    };
  }, [data, isSuccess, isLoading, isError, options]);
}

export default useStacApi;
