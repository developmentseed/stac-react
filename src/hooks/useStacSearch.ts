import { useCallback, useState } from 'react';
import ApiClient from '../api-client';

import type { Link, Item, Bbox } from '../types';

type SearchResponse = {
  type: 'FeatureCollection'
  features: Item[]
  links: Link[]
}

type StacSearchHook = {
  bbox?: Bbox
  setBbox: (bbox: Bbox) => void
  submit: () => void
  results?: SearchResponse
}

function useStacSearch(apiUrl: string): StacSearchHook {
  const [ results, setResults ] = useState<SearchResponse>();
  const [ bbox, setBbox ] = useState<Bbox>();
  
  const submit = useCallback(
    () => {
      const apiClient = new ApiClient(apiUrl);
      const payload = {
        bbox
      };
  
      apiClient.search(payload)
        .then(response => response.json())
        .then(data => setResults(data));
    }, [apiUrl, bbox]
  );

  return { submit, bbox, setBbox, results };
}

export default useStacSearch;