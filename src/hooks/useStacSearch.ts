import { useCallback, useState, useMemo, useEffect } from 'react';
import debounce from '../utils/debounce';
import type { ApiError, LoadingState } from '../types';
import type {
  Link,
  Bbox,
  CollectionIdList,
  SearchPayload,
  SearchResponse,
  LinkBody,
  Sortby,
} from '../types/stac';
import { useStacApiContext } from '../context/useStacApiContext';

type PaginationHandler = () => void;

type StacSearchHook = {
  ids?: string[];
  setIds: (ids: string[]) => void;
  bbox?: Bbox;
  setBbox: (bbox: Bbox) => void;
  collections?: CollectionIdList;
  setCollections: (collectionIds: CollectionIdList) => void;
  dateRangeFrom?: string;
  setDateRangeFrom: (date: string) => void;
  dateRangeTo?: string;
  setDateRangeTo: (date: string) => void;
  limit?: number;
  setLimit: (limit: number) => void;
  sortby?: Sortby[];
  setSortby: (sort: Sortby[]) => void;
  submit: () => void;
  results?: SearchResponse;
  state: LoadingState;
  error: ApiError | undefined;
  nextPage: PaginationHandler | undefined;
  previousPage: PaginationHandler | undefined;
};

function useStacSearch(): StacSearchHook {
  const { stacApi } = useStacApiContext();
  const [results, setResults] = useState<SearchResponse>();
  const [ids, setIds] = useState<string[]>();
  const [bbox, setBbox] = useState<Bbox>();
  const [collections, setCollections] = useState<CollectionIdList>();
  const [dateRangeFrom, setDateRangeFrom] = useState<string>('');
  const [dateRangeTo, setDateRangeTo] = useState<string>('');
  const [limit, setLimit] = useState<number>(25);
  const [sortby, setSortby] = useState<Sortby[]>();
  const [state, setState] = useState<LoadingState>('IDLE');
  const [error, setError] = useState<ApiError>();

  const [nextPageConfig, setNextPageConfig] = useState<Link>();
  const [previousPageConfig, setPreviousPageConfig] = useState<Link>();

  const reset = () => {
    setResults(undefined);
    setBbox(undefined);
    setCollections(undefined);
    setIds(undefined);
    setDateRangeFrom('');
    setDateRangeTo('');
    setSortby(undefined);
    setLimit(25);
  };

  /**
   * Reset state when stacApi changes
   */
  useEffect(reset, [stacApi]);

  /**
   * Extracts the pagination config from the the links array of the items response
   */
  const setPaginationConfig = useCallback((links: Link[]) => {
    setNextPageConfig(links.find(({ rel }) => rel === 'next'));
    setPreviousPageConfig(links.find(({ rel }) => ['prev', 'previous'].includes(rel)));
  }, []);

  /**
   * Returns the search payload based on the current application state
   */
  const getSearchPayload = useCallback(
    () => ({
      ids,
      bbox,
      collections,
      dateRange: { from: dateRangeFrom, to: dateRangeTo },
      sortby,
      limit,
    }),
    [ids, bbox, collections, dateRangeFrom, dateRangeTo, sortby, limit]
  );

  /**
   * Resets the state and processes the results from the provided request
   */
  const processRequest = useCallback(
    (request: Promise<Response>) => {
      setResults(undefined);
      setState('LOADING');
      setError(undefined);
      setNextPageConfig(undefined);
      setPreviousPageConfig(undefined);

      request
        .then((response) => response.json())
        .then((data) => {
          setResults(data);
          if (data.links) {
            setPaginationConfig(data.links);
          }
        })
        .catch((err) => setError(err))
        .finally(() => setState('IDLE'));
    },
    [setPaginationConfig]
  );

  /**
   * Executes a POST request against the `search` endpoint using the provided payload and headers
   */
  const executeSearch = useCallback(
    (payload: SearchPayload, headers = {}) =>
      stacApi && processRequest(stacApi.search(payload, headers)),
    [stacApi, processRequest]
  );

  /**
   * Execute a GET request against the provided URL
   */
  const getItems = useCallback(
    (url: string) => stacApi && processRequest(stacApi.get(url)),
    [stacApi, processRequest]
  );

  /**
   * Retrieves a page from a paginated item set using the provided link config.
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
              ...getSearchPayload(),
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

  const nextPageFn = useCallback(() => flipPage(nextPageConfig), [flipPage, nextPageConfig]);

  const previousPageFn = useCallback(
    () => flipPage(previousPageConfig),
    [flipPage, previousPageConfig]
  );

  const _submit = useCallback(() => {
    const payload = getSearchPayload();
    executeSearch(payload);
  }, [executeSearch, getSearchPayload]);
  const submit = useMemo(() => debounce(_submit), [_submit]);

  return {
    submit,
    ids,
    setIds,
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
    sortby,
    setSortby,
    limit,
    setLimit,
    nextPage: nextPageConfig ? nextPageFn : undefined,
    previousPage: previousPageConfig ? previousPageFn : undefined,
  };
}

export default useStacSearch;
