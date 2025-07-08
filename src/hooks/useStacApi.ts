import { useContext, useEffect, useState } from 'react';
import StacApi, { SearchMode } from '../stac-api';
import { Link } from '../types/stac';
import { GenericObject } from '../types';
import { StacApiContext } from '../context/context';

type StacApiHook = {
  stacApi?: StacApi;
};

function useStacApi(url?: string, options?: GenericObject): StacApiHook {
  // The context uses this hook to get the StacApi instance.
  // If a URL is provided, it will create a new StacApi instance.
  // If no URL is provided, it will use the StacApi instance from the context.
  // This allows the hook to be used in different contexts, such as in using the
  // existing instance or to create a new one.
  const { stacApi: ctxStacApi } = useContext(StacApiContext);

  const [stacApi, setStacApi] = useState<StacApi>();

  useEffect(() => {
    if (!url) {
      if (ctxStacApi) {
        setStacApi(ctxStacApi);
      } else {
        throw new Error(
          'StacApi URL is required when no StacApiContext is available.'
        );
      }
      return;
    }

    let baseUrl: string;
    let searchMode = SearchMode.GET;

    const headers = options?.headers || { 'Content-Type': 'application/json' };

    fetch(url, {
      headers
    })
      .then((response) => {
        baseUrl = response.url;
        return response;
      })
      .then((response) => response.json())
      .then((response) => {
        const doesPost = response.links.find(
          ({ rel, method }: Link) => rel === 'search' && method === 'POST'
        );
        if (doesPost) {
          searchMode = SearchMode.POST;
        }
      })
      .then(() => setStacApi(new StacApi(baseUrl, searchMode, options)));
  }, [url, options, ctxStacApi]);

  return { stacApi };
}

export default useStacApi;
