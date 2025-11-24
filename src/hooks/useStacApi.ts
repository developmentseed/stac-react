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
      let searchMode = SearchMode.GET;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      const baseUrl = response.url;
      const json = await response.json();
      const doesPost = json.links?.find(
        ({ rel, method }: Link) => rel === 'search' && method === 'POST'
      );
      if (doesPost) {
        searchMode = SearchMode.POST;
      }
      return new StacApi(baseUrl, searchMode, options);
    },
    staleTime: Infinity,
  });
  return { stacApi: isSuccess ? data : undefined, isLoading, isError };
}

export default useStacApi;
