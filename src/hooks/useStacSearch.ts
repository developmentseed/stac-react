import { useCallback, useState } from 'react';
import StacApi from '../stac-api';

import type {
  Link,
  Item,
  Bbox,
  CollectionIdList,
  ApiError,
  SearchPayload,
  LinkBody
} from '../types';

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

  const [ nextPageConfig, setNextPageConfig ] = useState<Link>();
  const [ previousPageConfig, setPreviousPageConfig ] = useState<Link>();

  const setPaginationConfig = useCallback(
    (links: Link[]) => {
      setNextPageConfig(links.find(({ rel }) => rel === 'next'));
      setPreviousPageConfig(links.find(({ rel }) => ['prev', 'previous'].includes(rel)));
    }, []
  );

  const getSearchPayload = useCallback(
    () => ({
      bbox,
      collections,
      dateRange: { from: dateRangeFrom, to: dateRangeTo }
    }),
    [ bbox, collections, dateRangeFrom, dateRangeTo ]
  );

  const executeSearch = useCallback(
    (payload: SearchPayload, headers = {}) => {
      setResults(undefined);
      setState('LOADING');
      setError(undefined);
      setNextPageConfig(undefined);
      setPreviousPageConfig(undefined);

      stacApi.search(payload, headers)
        .then(response => response.json())
        .then(data => {
          setResults(data);
          setPaginationConfig(data.links);
        })
        .catch((err) => setError(err))
        .finally(() => setState('IDLE'));
    },
    [stacApi, setPaginationConfig]
  );

  const flipPage = useCallback(
    (link?: Link) => {
      if (link) {
        let payload = link.body as LinkBody;
        if (payload.merge) {
          payload = {
            ...payload,
            ...getSearchPayload()
          };
        }
        executeSearch(payload, link.headers);
      }
    },
    [executeSearch, getSearchPayload]
  );

  const nextPageFn = useCallback(
    () => flipPage(nextPageConfig),
    [flipPage, nextPageConfig]
  );

  const previousPageFn = useCallback(
    () => flipPage(previousPageConfig),
    [flipPage, previousPageConfig]
  );
  
  const submit = useCallback(
    () => {
      const payload = getSearchPayload();
      executeSearch(payload); 
    }, [executeSearch, getSearchPayload]
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
    nextPage: nextPageConfig ? nextPageFn : undefined,
    previousPage: previousPageConfig ? previousPageFn : undefined
  };
}

export default useStacSearch;
