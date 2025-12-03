import { useCallback, useEffect, useState, useMemo } from 'react';
import { type ApiError, type LoadingState } from '../types';
import type { CollectionsPayload, CollectionsResponse, Link /*LinkBody*/ } from '../types/stac';
import debounce from '../utils/debounce';
import { useStacApiContext } from '../context';

type PaginationHandler = () => void;

type StacCollectionsHook = {
  collections?: CollectionsResponse;
  reload: () => void;
  state: LoadingState;
  error?: ApiError;
  nextPage: PaginationHandler | undefined
  previousPage: PaginationHandler | undefined
};

function useCollections(): StacCollectionsHook {
  const { stacApi, collections, setCollections } = useStacApiContext();
  const [ state, setState ] = useState<LoadingState>('IDLE');
  const [ error, setError ] = useState<ApiError>();

  const [ nextPageConfig, setNextPageConfig ] = useState<Link>();
  const [ previousPageConfig, setPreviousPageConfig ] = useState<Link>();

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
   * Resets the state and processes the results from the provided request
   */
  const processRequest = useCallback((request: Promise<Response>) => {
    setState('LOADING');
    setError(undefined);
    setNextPageConfig(undefined);
    setPreviousPageConfig(undefined);

    request
      .then(response => response.json())
      .then(data => {
        setCollections(data);
        if (data.links) {
          setPaginationConfig(data.links);
        }
      })
      .catch((err) => setError(err))
      .finally(() => setState('IDLE'));
  }, [setPaginationConfig, setCollections]);

  const _getCollections = useCallback(
    (payload?: CollectionsPayload) => {
      if (stacApi) {
        processRequest(stacApi.getCollections(payload));
      }
    },
    [stacApi, processRequest]
  );
  const getCollections = useMemo(() => debounce(_getCollections), [_getCollections]);

  /**
   * Retreives a page from a paginatied item set using the provided link config.
   * Executes a POST request against the `search` endpoint if pagination uses POST
   * or retrieves the page items using GET against the link href
   */

  const flipPage = useCallback(
    (config?: any) => {
      if (config.href) {
        const url = new URL(config.href);
        const params = url.searchParams;
        const urlParams = Object.fromEntries(params.entries());
        const payload = {
          ...urlParams,
        };
        getCollections(payload);
      }
    },
    [getCollections]
  );

  const nextPageFn = useCallback(
    () => flipPage(nextPageConfig),
    [flipPage, nextPageConfig]
  );

  const previousPageFn = useCallback(
    () => flipPage(previousPageConfig),
    [flipPage, previousPageConfig]
  );

  useEffect(
    () => {
      if (stacApi && !error && !collections) {
        getCollections();
      }
    },
    [getCollections, stacApi, collections, error]
  );

  return {
    collections,
    reload: getCollections,
    state,
    error,
    nextPage: nextPageConfig ? nextPageFn : undefined,
    previousPage: previousPageConfig ? previousPageFn : undefined
  };
}

export default useCollections;
