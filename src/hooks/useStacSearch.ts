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
  dateRangeFrom?: string
  setDateRangeFrom: (date: string) => void
  dateRangeTo?: string
  setDateRangeTo: (date: string) => void
  submit: () => void
  results?: SearchResponse
}

function useStacSearch(apiUrl: string): StacSearchHook {
  const [ results, setResults ] = useState<SearchResponse>();
  const [ bbox, setBbox ] = useState<Bbox>();
  const [ collections, setCollections ] = useState<CollectionIdList>();
  const [ dateRangeFrom, setDateRangeFrom ] = useState<string>('');
  const [ dateRangeTo, setDateRangeTo ] = useState<string>('');
  
  const submit = useCallback(
    () => {
      const apiClient = new ApiClient(apiUrl);
      const payload = {
        bbox,
        collections,
        dateRange: { from: dateRangeFrom, to: dateRangeTo }
      };
  
      apiClient.search(payload)
        .then(response => response.json())
        .then(data => setResults(data));
    }, [apiUrl, bbox, collections, dateRangeFrom, dateRangeTo]
  );

  return {
    submit,
    bbox,
    setBbox,
    collections,
    setCollections,
    dateRangeFrom,
    setDateRangeFrom,
    dateRangeTo,
    setDateRangeTo,
    results
  };
}

export default useStacSearch;
