import { useState, useEffect} from 'react';
import { Item } from '../types/stac';
import { ApiError, LoadingState } from '../types';
import { useStacApiContext } from '../context';

type ItemHook = {
  item?: Item
  state: LoadingState
  error?: ApiError
}

function useItem(url: string): ItemHook {
  const { stacApi, getItem, addItem } = useStacApiContext();
  const [ state, setState ] = useState<LoadingState>('IDLE');
  const [ item, setItem ] = useState<Item>();
  const [ error, setError ] = useState<ApiError>();

  useEffect(() => {
    if (!stacApi) return;

    setState('LOADING');
    new Promise((resolve, reject) => {
      const i = getItem(url);
      if (i) {
        resolve(i);
      } else {
        stacApi.fetch(url)
          .then(r => r.json())
          .then(r => {
            addItem(url, r);
            resolve(r);
          })
          .catch((err) => reject(err));
      }
    })
      .then(setItem)
      .catch((err) => setError(err))
      .finally(() => setState('IDLE'));
  }, [stacApi, addItem, getItem, url]);

  return { 
    item,
    state,
    error
  };
}

export default useItem;
