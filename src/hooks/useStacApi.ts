import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import StacApi, { OptionsGetter, SearchMode } from '../stac-api';
import { Link } from '../types/stac';
import { GenericObject } from '../types';
import { generateStacApiQueryKey } from '../utils/queryKeys';
import { handleStacResponse } from '../utils/handleStacResponse';

type StacApiHook = {
  stacApi?: StacApi;
  isLoading: boolean;
  isError: boolean;
};

function resolveOptions(
  options: GenericObject | OptionsGetter | undefined
): GenericObject | undefined {
  return typeof options === 'function' ? options() : options;
}

function useStacApi(url: string, options?: GenericObject | OptionsGetter): StacApiHook {
  // Hold the latest options in a ref so the StacApi instance reads fresh values
  // per request without rebuilding. Both static and callable forms route through
  // the ref, so consumers don't have to memoize a static options object.
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const { data, isSuccess, isLoading, isError } = useQuery({
    // options is intentionally NOT part of the key — see optionsRef above.
    // Strict-Mode double-mounts are safe because staleTime: Infinity keeps
    // the cached instance.
    queryKey: generateStacApiQueryKey(url),
    queryFn: async () => {
      const initial = resolveOptions(optionsRef.current);
      const response = await fetch(url, {
        headers: {
          ...initial?.headers,
        },
      });
      const stacData = await handleStacResponse<{ links?: Link[] }>(response);

      const searchMode = stacData.links?.find(
        ({ rel, method }: Link) => rel === 'search' && method === 'POST'
      )
        ? SearchMode.POST
        : SearchMode.GET;

      return new StacApi(response.url, searchMode, () => resolveOptions(optionsRef.current));
    },
    staleTime: Infinity,
  });
  return { stacApi: isSuccess ? data : undefined, isLoading, isError };
}

export default useStacApi;
