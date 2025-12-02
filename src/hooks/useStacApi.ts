import { useQuery } from '@tanstack/react-query';
import StacApi, { SearchMode } from '../stac-api';
import { Link } from '../types/stac';
import { GenericObject } from '../types';
import { generateStacApiQueryKey } from '../utils/queryKeys';

type StacApiHook = {
  stacApi?: StacApi;
  isLoading: boolean;
  isError: boolean;
};

function useStacApi(url: string, options?: GenericObject): StacApiHook {
  const { data, isSuccess, isLoading, isError } = useQuery({
    queryKey: generateStacApiQueryKey(url, options),
    queryFn: async () => {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      const stacData = await StacApi.handleResponse<{ links?: Link[] }>(response);

      const doesPost = stacData.links?.find(
        ({ rel, method }: Link) => rel === 'search' && method === 'POST'
      );

      return new StacApi(response.url, doesPost ? SearchMode.POST : SearchMode.GET, options);
    },
    staleTime: Infinity,
  });

  return { stacApi: isSuccess ? data : undefined, isLoading, isError };
}

export default useStacApi;
