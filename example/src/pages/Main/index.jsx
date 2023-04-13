import { useCallback, useState } from "react";
import { useStacSearch, useCollections, useStacApi } from "stac-react";

import ItemList from "./ItemList";
import Map from "./Map";
import QueryBuilder from "./QueryBuilder";

const options = {
  headers: {
    Authorization: "Basic " + btoa(process.env.REACT_APP_STAC_API_TOKEN + ":")
  }
};

function Main() {
  const [isBboxDrawEnabled, setIsBboxDrawEnabled] = useState(false);
  const { stacApi } = useStacApi(process.env.REACT_APP_STAC_API, options);

  const { collections } = useCollections(stacApi);

  const {
    setBbox,
    collections: selectedCollections,
    setCollections,
    dateRangeFrom,
    setDateRangeFrom,
    dateRangeTo,
    setDateRangeTo,
    submit,
    results,
    state,
    error,
    nextPage,
    previousPage
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
        selectedCollections={selectedCollections}
        setCollections={setCollections}
        dateRangeFrom={dateRangeFrom}
        setDateRangeFrom={setDateRangeFrom}
        dateRangeTo={dateRangeTo}
        setDateRangeTo={setDateRangeTo}
      />
      <ItemList
        items={results}
        isLoading={state === 'LOADING'}
        error={error && 'Error loading results'}
        nextPage={nextPage}
        previousPage={previousPage}
      />
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
