import { useCallback, useEffect, useState } from 'react';
import { type ApiError, type LoadingState } from '../types';
import type { CollectionsResponse } from '../types/stac';
import debounce from '../utils/debounce';
import { useStacApiContext } from '../context';

type StacCollectionsHook = {
  collections?: CollectionsResponse;
  reload: () => void;
  state: LoadingState;
  error?: ApiError;
  nextPage?: () => void;
  prevPage?: () => void;
  setCurrentUrl: (url: string | undefined) => void;
};

export default function useCollections(): StacCollectionsHook {
  const { stacApi, collections, setCollections } = useStacApiContext();
  const [state, setState] = useState<LoadingState>('IDLE');
  const [error, setError] = useState<ApiError>();

  const [nextUrl, setNextUrl] = useState<string | undefined>();
  const [prevUrl, setPrevUrl] = useState<string | undefined>();
  const [currentUrl, setCurrentUrl] = useState<string | undefined>();


  const _getCollections = useCallback(
    async (url?: string) => {
      if (stacApi) {
        setState('LOADING');

        try {
          const res = await stacApi.getCollections(url);
          const data: CollectionsResponse = await res.json();

          setNextUrl(data.links?.find((l) => l.rel === 'next')?.href);
          setPrevUrl(
            data.links?.find((l) => ['prev', 'previous'].includes(l.rel))?.href
          );

          setCollections(data);
        } catch (err: any) {
          setError(err);
          setCollections(undefined);
        } finally {
          setState('IDLE');
        }
      }
    },
    [setCollections, stacApi]
  );

  const getCollections = useCallback(
    (url?: string) => debounce(() => _getCollections(url))(),
    [_getCollections]
  );

  const nextPage = useCallback(() => setCurrentUrl(nextUrl), [nextUrl]);
  const prevPage = useCallback(() => setCurrentUrl(prevUrl), [prevUrl]);

  useEffect(() => {
    if (stacApi && !error) {
      getCollections(currentUrl);
    }
  }, [getCollections, stacApi, error, currentUrl]);

  return {
    collections,
    reload: useCallback(
      () => getCollections(currentUrl),
      [getCollections, currentUrl]
    ),
    nextPage: nextUrl ? nextPage : undefined,
    prevPage: prevUrl ? prevPage : undefined,
    setCurrentUrl,
    state,
    error
  };
}
