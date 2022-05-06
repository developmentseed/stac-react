import { useCallback, useState } from 'react';
import ApiClient from '../api-client';

import type { Link, Item, Bbox, CollectionIdList } from '../types';

type SearchResponse = {
  type: 'FeatureCollection'
  features: Item[]
  links: Link[]
}

type StacSearchHook = {
  bbox?: Bbox
  setBbox: (bbox: Bbox) => void
  collections?: CollectionIdList
  setCollections: (collectionIds: CollectionIdList) => void
  submit: () => void
  results?: SearchResponse
}

function useStacSearch(apiUrl: string): StacSearchHook {
  const [ results, setResults ] = useState<SearchResponse>();
  const [ bbox, setBbox ] = useState<Bbox>();
  const [ collections, setCollections ] = useState<CollectionIdList>();
  
  const submit = useCallback(
    () => {
      const apiClient = new ApiClient(apiUrl);
      const payload = {
        bbox,
        collections
      };
  
      apiClient.search(payload)
        .then(response => response.json())
        .then(data => setResults(data));
    }, [apiUrl, bbox, collections]
  );

  return {
    submit,
    bbox,
    setBbox,
    collections,
    setCollections,
    results
  };
}

export default useStacSearch;
