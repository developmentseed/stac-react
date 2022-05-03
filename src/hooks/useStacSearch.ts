import { useState } from 'react';
import ApiClient from '../api-client';

type StacSearchHook = {
  bbox?: Bbox
  setBbox: (bbox: Bbox) => void
  submit: () => void
  results?: []
}

function useStacSearch(apiUrl: string): StacSearchHook {
  const apiClient = new ApiClient(apiUrl);
  const [ results, setResults ] = useState();
  const [ bbox, setBbox ] = useState<Bbox>();

  const submit = () => {
    const payload = {
      bbox
    };

    apiClient.search(payload)
      .then(response => response.json())
      .then(data => setResults(data));
  };

  return { submit, bbox, setBbox, results };
}

export default useStacSearch;