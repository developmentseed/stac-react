import { useCallback, useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import debounce from '../utils/debounce';
import { generateStacSearchQueryKey } from '../utils/queryKeys';
import { type ApiErrorType } from '../types';
import type {
  Link,
  Bbox,
  CollectionIdList,
  SearchResponse,
  Sortby,
  FetchRequest,
} from '../types/stac';
import { useStacApiContext } from '../context/useStacApiContext';

type PaginationHandler = () => void;

type StacSearchHook = {
  ids?: string[];
  setIds: (ids?: string[]) => void;
  bbox?: Bbox;
  setBbox: (bbox?: Bbox) => void;
  collections?: CollectionIdList;
  setCollections: (collections?: CollectionIdList) => void;
  dateRangeFrom?: string;
  setDateRangeFrom: (date?: string) => void;
  dateRangeTo?: string;
  setDateRangeTo: (date?: string) => void;
  sortby?: Sortby[];
  setSortby: (sortby?: Sortby[]) => void;
  limit: number;
  setLimit: (limit: number) => void;
  submit: () => void;
  results?: SearchResponse;
  isLoading: boolean;
  isFetching: boolean;
  error?: ApiErrorType;
  nextPage: PaginationHandler | undefined;
  previousPage: PaginationHandler | undefined;
};

function useStacSearch(): StacSearchHook {
  const { stacApi } = useStacApiContext();
  const queryClient = useQueryClient();

  // Search parameters state
  const [ids, setIds] = useState<string[]>();
  const [bbox, setBbox] = useState<Bbox>();
  const [collections, setCollections] = useState<CollectionIdList>();
  const [dateRangeFrom, setDateRangeFrom] = useState<string>();
  const [dateRangeTo, setDateRangeTo] = useState<string>();
  const [limit, setLimit] = useState<number>(25);
  const [sortby, setSortby] = useState<Sortby[]>();

  // Track the current request (search or pagination) for React Query
  const [currentRequest, setCurrentRequest] = useState<FetchRequest | null>(null);

  const [nextPageConfig, setNextPageConfig] = useState<Link>();
  const [previousPageConfig, setPreviousPageConfig] = useState<Link>();

  const reset = () => {
    setBbox(undefined);
    setCollections(undefined);
    setIds(undefined);
    setDateRangeFrom(undefined);
    setDateRangeTo(undefined);
    setSortby(undefined);
    setLimit(25);
    setCurrentRequest(null);
    setNextPageConfig(undefined);
    setPreviousPageConfig(undefined);
  };

  /**
   * Reset state when stacApi changes
   */
  useEffect(() => {
    if (stacApi) {
      reset();
      // Invalidate all search queries when API changes
      void queryClient.invalidateQueries({ queryKey: ['stacSearch'] });
    }
  }, [stacApi, queryClient]);

  /**
   * Extracts the pagination config from the links array of the items response
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
   * useQuery for search and pagination with caching
   */
  const {
    data: results,
    error,
    isLoading,
    isFetching,
  } = useQuery<SearchResponse, ApiErrorType>({
    queryKey: currentRequest ? generateStacSearchQueryKey(currentRequest) : ['stacSearch', 'idle'],
    queryFn: () =>
      currentRequest!.type === 'search'
        ? stacApi!.search(currentRequest!.payload, currentRequest!.headers)
        : stacApi!.get<SearchResponse>(currentRequest!.url),
    enabled: !!stacApi && currentRequest !== null,
    retry: false,
  });

  /**
   * Extract pagination links from results
   */
  useEffect(() => {
    // Only update pagination links when we have actual results with links
    // Don't clear them when results becomes undefined (during new requests)
    if (results?.links) {
      setPaginationConfig(results.links);
    }
  }, [results, setPaginationConfig]);

  /**
   * Convert a pagination Link to a FetchRequest
   */
  const linkToRequest = useCallback(
    (link: Link): FetchRequest => {
      if (link.body) {
        const payload = link.body.merge ? { ...link.body, ...getSearchPayload() } : link.body;
        return {
          type: 'search',
          payload,
          headers: link.headers,
        };
      }
      return {
        type: 'get',
        url: link.href,
      };
    },
    [getSearchPayload]
  );

  /**
   * Pagination handlers
   */
  const nextPageFn = useCallback(() => {
    if (nextPageConfig) {
      setCurrentRequest(linkToRequest(nextPageConfig));
    }
  }, [nextPageConfig, linkToRequest]);

  const previousPageFn = useCallback(() => {
    if (previousPageConfig) {
      setCurrentRequest(linkToRequest(previousPageConfig));
    }
  }, [previousPageConfig, linkToRequest]);

  /**
   * Submit handler for new searches
   */
  const _submit = useCallback(() => {
    const payload = getSearchPayload();
    setCurrentRequest({ type: 'search', payload });
  }, [getSearchPayload]);

  const submit = useMemo(() => debounce(_submit, 300), [_submit]);

  // Clean up debounced function on unmount or when _submit changes
  useEffect(() => {
    return () => {
      submit.cancel();
    };
  }, [submit]);

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
    isLoading,
    isFetching,
    error: error ?? undefined,
    sortby,
    setSortby,
    limit,
    setLimit,
    nextPage: nextPageConfig ? nextPageFn : undefined,
    previousPage: previousPageConfig ? previousPageFn : undefined,
  };
}

export default useStacSearch;
