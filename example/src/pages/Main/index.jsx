import { useCallback, useState } from "react";
import { useStacSearch, StacApi } from "stac-react";

import ItemList from "./ItemList";
import Map from "./Map";
import QueryBuilder from "./QueryBuilder";

function Main() {
  const [isBboxDrawEnabled, setIsBboxDrawEnabled] = useState(false);
  const stacApi = new StacApi(process.env.REACT_APP_STAC_API)
  const {
    setBbox,
    collections,
    setCollections,
    dateRangeFrom,
    setDateRangeFrom,
    dateRangeTo,
    setDateRangeTo,
    submit,
    results,
    state,
    error
  } = useStacSearch(stacApi);

  const handleDrawComplete = useCallback((feature) => {
    setIsBboxDrawEnabled(false);
    
    const { coordinates } = feature.geometry;
    const bbox = [...coordinates[0][0], ...coordinates[0][2]];
    setBbox(bbox);
  }, [setBbox]);

  return (
    <div className='grid grid-cols-4 gap-4 m-4'>
      <QueryBuilder
        setIsBboxDrawEnabled={setIsBboxDrawEnabled}
        handleSubmit={submit}
        collections={collections}
        setCollections={setCollections}
        dateRangeFrom={dateRangeFrom}
        setDateRangeFrom={setDateRangeFrom}
        dateRangeTo={dateRangeTo}
        setDateRangeTo={setDateRangeTo}
      />
      <ItemList items={results} isLoading={state === 'LOADING'} error={error && 'Error loading results'} />
      <Map
        className='col-span-2'
        isBboxDrawEnabled={isBboxDrawEnabled}
        handleDrawComplete={handleDrawComplete}
        items={results}
      />
    </div>
  );
}

export default Main;
