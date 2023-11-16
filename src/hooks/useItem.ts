import { useState, useEffect} from 'react';
import { Item } from '../types/stac';
import { LoadingState } from '../types';
import { useStacApiContext } from '../context';

type ItemHook = {
  item?: Item
  state: LoadingState
}

function useItem(url: string): ItemHook {
  const { getItem, addItem } = useStacApiContext();
  const [ state, setState ] = useState<LoadingState>('IDLE');
  const [ item, setItem ] = useState<Item>();

  useEffect(() => {
    setState('LOADING');
    new Promise((resolve) => {
      const i = getItem(url);
      if (i) {
        resolve(i);
      } else {
        fetch(url)
          .then(r => r.json())
          .then(r => {
            addItem(url, r);
            resolve(r);
          });
      }
    })
      .then(setItem)
      .finally(() => setState('IDLE'));
  }, [addItem, getItem, url]);

  return { 
    item,
    state
  };
}

export default useItem;
