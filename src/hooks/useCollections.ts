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
  setOffset: (newOffset: number) => void;
};

export default function useCollections(opts?: {
  limit?: number;
  initialOffset?: number;
}): StacCollectionsHook {
  const { limit = 10, initialOffset = 0 } = opts || {};

  const { stacApi, collections, setCollections } = useStacApiContext();
  const [state, setState] = useState<LoadingState>('IDLE');
  const [error, setError] = useState<ApiError>();

  const [offset, setOffset] = useState(initialOffset);

  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const _getCollections = useCallback(
    async (offset: number, limit: number) => {
      if (stacApi) {
        setState('LOADING');

        try {
          const res = await stacApi.getCollections({ limit, offset });
          const data: CollectionsResponse = await res.json();

          setHasNext(!!data.links?.find((l) => l.rel === 'next'));
          setHasPrev(
            !!data.links?.find((l) => ['prev', 'previous'].includes(l.rel))
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
    (offset: number, limit: number) =>
      debounce(() => _getCollections(offset, limit))(),
    [_getCollections]
  );

  const nextPage = useCallback(() => {
    setOffset(offset + limit);
  }, [offset, limit]);

  const prevPage = useCallback(() => {
    setOffset(offset - limit);
  }, [offset, limit]);

  useEffect(() => {
    if (stacApi && !error && !collections) {
      getCollections(offset, limit);
    }
  }, [getCollections, stacApi, collections, error, offset, limit]);

  return {
    collections,
    reload: useCallback(
      () => getCollections(offset, limit),
      [getCollections, offset, limit]
    ),
    nextPage: hasNext ? nextPage : undefined,
    prevPage: hasPrev ? prevPage : undefined,
    setOffset,
    state,
    error
  };
}
