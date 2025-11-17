import { useCallback, useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import debounce from '../utils/debounce';
import type { ApiError, LoadingState } from '../types';
import type {
  Link,
  Bbox,
  CollectionIdList,
  SearchPayload,
  SearchResponse,
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

type FetchRequest =
  | {
      type: 'search';
      payload: SearchPayload;
      headers?: Record<string, string>;
    }
  | {
      type: 'get';
      url: string;
    };

function useStacSearch(): StacSearchHook {
  const { stacApi } = useStacApiContext();
  const queryClient = useQueryClient();

  // Search parameters state
  const [ids, setIds] = useState<string[]>();
  const [bbox, setBbox] = useState<Bbox>();
  const [collections, setCollections] = useState<CollectionIdList>();
  const [dateRangeFrom, setDateRangeFrom] = useState<string>('');
  const [dateRangeTo, setDateRangeTo] = useState<string>('');
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
    setDateRangeFrom('');
    setDateRangeTo('');
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
   * Fetch function for searches using TanStack Query
   */
  const fetchRequest = async (request: FetchRequest): Promise<SearchResponse> => {
    if (!stacApi) throw new Error('No STAC API configured');

    const response =
      request.type === 'search'
        ? await stacApi.search(request.payload, request.headers)
        : await stacApi.get(request.url);

    if (!response.ok) {
      let detail;
      try {
        detail = await response.json();
      } catch {
        detail = await response.text();
      }
      const err = Object.assign(new Error(response.statusText), {
        status: response.status,
        statusText: response.statusText,
        detail,
      });
      throw err;
    }
    return await response.json();
  };

  /**
   * useQuery for search and pagination with caching
   */
  const {
    data: results,
    error,
    isLoading,
    isFetching,
  } = useQuery<SearchResponse, ApiError>({
    queryKey: ['stacSearch', currentRequest],
    queryFn: () => fetchRequest(currentRequest!),
    enabled: currentRequest !== null,
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

  const submit = useMemo(() => debounce(_submit), [_submit]);

  // Sync loading state for backwards compatibility
  const state: LoadingState = isLoading || isFetching ? 'LOADING' : 'IDLE';

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
