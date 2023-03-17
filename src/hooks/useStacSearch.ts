import { useCallback, useState, useMemo, useEffect } from 'react';
import StacApi from '../stac-api';
import debounce from '../utils/debounce';
import type { ApiError, LoadingState } from '../types';
import type {
  Link,
  Bbox,
  CollectionIdList,
  SearchPayload,
  SearchResponse,
  LinkBody,
} from '../types/stac';

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

  const reset = () => {
    setResults(undefined);
    setBbox(undefined);
    setCollections(undefined);
    setDateRangeFrom('');
    setDateRangeTo('');
  };

  /**
   * Reset state when stacApu changes
   */
  useEffect(reset, [stacApi]);

  /**
   * Extracts the pagination config from the the links array of the items response
   */
  const setPaginationConfig = useCallback(
    (links: Link[]) => {
      setNextPageConfig(links.find(({ rel }) => rel === 'next'));
      setPreviousPageConfig(links.find(({ rel }) => ['prev', 'previous'].includes(rel)));
    }, []
  );

  /**
   * Returns the search payload based on the current application state
   */
  const getSearchPayload = useCallback(
    () => ({
      bbox,
      collections,
      dateRange: { from: dateRangeFrom, to: dateRangeTo }
    }),
    [ bbox, collections, dateRangeFrom, dateRangeTo ]
  );

  /**
   * Resets the state and processes the results from the provided request
   */
  const processRequest = useCallback((request: Promise<Response>) => {
    setResults(undefined);
    setState('LOADING');
    setError(undefined);
    setNextPageConfig(undefined);
    setPreviousPageConfig(undefined);

    request
      .then(response => response.json())
      .then(data => {
        setResults(data);
        if (data.links) {
          setPaginationConfig(data.links);
        }
      })
      .catch((err) => setError(err))
      .finally(() => setState('IDLE'));
  }, [setPaginationConfig]);

  /**
   * Executes a POST request against the `search` endpoint using the provided payload and headers
   */
  const executeSearch = useCallback(
    (payload: SearchPayload, headers = {}) => processRequest(stacApi.search(payload, headers)),
    [stacApi, processRequest]
  );

  /**
   * Execute a GET request against the provided URL
   */
  const getItems = useCallback(
    (url: string) => processRequest(stacApi.get(url)),
    [stacApi, processRequest]
  );

  /**
   * Retreives a page from a paginatied item set using the provided link config.
   * Executes a POST request against the `search` endpoint if pagination uses POST
   * or retrieves the page items using GET against the link href
   */
  const flipPage = useCallback(
    (link?: Link) => {
      if (link) {
        let payload = link.body as LinkBody;
        if (payload) {
          if (payload.merge) {
            payload = {
              ...payload,
              ...getSearchPayload()
            };
          }
          executeSearch(payload, link.headers);
        } else {
          getItems(link.href);
        }
      }
    },
    [executeSearch, getItems, getSearchPayload]
  );

  const nextPageFn = useCallback(
    () => flipPage(nextPageConfig),
    [flipPage, nextPageConfig]
  );

  const previousPageFn = useCallback(
    () => flipPage(previousPageConfig),
    [flipPage, previousPageConfig]
  );
  
  const _submit = useCallback(
    () => {
      const payload = getSearchPayload();
      executeSearch(payload); 
    }, [executeSearch, getSearchPayload]
  );
  const submit = useMemo(() => debounce(_submit), [_submit]);

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
