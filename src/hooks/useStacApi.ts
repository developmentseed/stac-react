import { useEffect, useState } from 'react';
import StacApi, { SearchMode } from '../stac-api';
import { Link } from '../types/stac';
import { GenericObject } from '../types';

type StacApiHook = {
  stacApi?: StacApi;
};

function useStacApi(url: string, options?: GenericObject): StacApiHook {
  const [stacApi, setStacApi] = useState<StacApi>();

  useEffect(() => {
    let baseUrl: string;
    let searchMode = SearchMode.GET;

    fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
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
      .then(() => setStacApi(new StacApi(baseUrl, searchMode, options)))
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error('Failed to initialize StacApi:', e);
      });
  }, [url, options]);

  return { stacApi };
}

export default useStacApi;
