import { useCallback, useState } from 'react';
import StacApi from '../stac-api';

import type { Link, Item, Bbox, CollectionIdList, ApiError, SearchPayload } from '../types';

type SearchResponse = {
  type: 'FeatureCollection'
  features: Item[]
  links: Link[]
}

type LoadingState = 'IDLE' | 'LOADING';

type PaginationHandler = () => void;

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
  state: LoadingState;
  error: ApiError | undefined
  nextPage: PaginationHandler | undefined
  previousPage: PaginationHandler | undefined
}

function useStacSearch(stacApi: StacApi): StacSearchHook {
  const [ results, setResults ] = useState<SearchResponse>();
  const [ bbox, setBbox ] = useState<Bbox>();
  const [ collections, setCollections ] = useState<CollectionIdList>();
  const [ dateRangeFrom, setDateRangeFrom ] = useState<string>('');
  const [ dateRangeTo, setDateRangeTo ] = useState<string>('');
  const [ state, setState ] = useState<LoadingState>('IDLE');
  const [ error, setError ] = useState<ApiError>();
  const [ nextPage, setNextPage ] = useState<PaginationHandler>();
  const [ previousPage, setPreviousPage ] = useState<PaginationHandler>();

  const loadNewPage = useCallback(
    (link: Link) => {
      const payload = link.body as SearchPayload;
  
      setResults(undefined);
      setState('LOADING');
      setError(undefined);
      setNextPage(undefined);
      setPreviousPage(undefined);
      stacApi.search(payload)
        .then(response => response.json())
        .then(data => {
          setResults(data);
          parsePagination(data.links);
        })
        .catch((err) => setError(err))
        .finally(() => setState('IDLE'));
    },
    []
  );

  const parsePagination = useCallback(
    (links: Link[]) => {
      const nextPageLink = links.find(({ rel }) => rel === 'next');
      if (nextPageLink) {
        setNextPage(() => () => loadNewPage(nextPageLink));
      }

      const previousPageLink = links.find(({ rel }) => rel === 'prev');
      if (previousPageLink) {
        setPreviousPage(() => () => loadNewPage(previousPageLink));
      }
    }, [loadNewPage]
  );
  
  const submit = useCallback(
    () => {
      const payload = {
        bbox,
        collections,
        dateRange: { from: dateRangeFrom, to: dateRangeTo }
      };
  
      setResults(undefined);
      setState('LOADING');
      setError(undefined);
      setNextPage(undefined);
      setPreviousPage(undefined);
      stacApi.search(payload)
        .then(response => response.json())
        .then(data => {
          setResults(data);
          parsePagination(data.links);
        })
        .catch((err) => setError(err))
        .finally(() => setState('IDLE'));
    }, [stacApi, bbox, collections, dateRangeFrom, dateRangeTo, parsePagination]
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
    results,
    state,
    error,
    nextPage,
    previousPage
  };
}

export default useStacSearch;
