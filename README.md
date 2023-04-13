# stac-react

React hooks to build front-end applications for STAC APIs. 

> **Note:**
> stac-react is in early development, the API will likely break in future versions. 

## Installation

With NPM:

```sh
npm i @developmentseed/stac-react
```

With Yarn:

```sh
yarn add @developmentseed/stac-react
```


## API

### StacApi

**Removed in 0.1.0-alpha.6:** Do not instanciate `StacApi` directly. Use the `useStacApi` hook instead. 

Initialises a STAC-API client. Pass the instance to the React hooks as documented below.

#### Example

```js
import { StacApi, useCollections } from "stac-react";

function CollectionList() {
  const stacApi = new StacApi("https://planetarycomputer.microsoft.com/api/stac/v1");
  const { collections } = useCollections(stacApi);

  return (
    <ul>
      {collections.map(({ id, title }) => (
        <li key={id}>{title}</li>
      ))}
    </ul>
  );
}
```

#### Initialization

```js
import { StacApi } from "stac-react";
const stacApi = new StacApi(url);
```

#### Options

Option          | Type      | Default | Description
--------------- | --------- | ------- | -------------
`url`           | `string`  |         | Required. The endpoint of the STAC API you want to connect to. 

### useCollections

Retrieves collections from a STAC catalog.

#### Initialization

```js
import { useCollections } from "stac-react";
const { collections } = useCollections(stacApi);
```

#### Options

Option          | Type      | Default  | Description
--------------- | --------- | -------- | -------------
`stacApi`       | Instance of `StacApi`| Required. The STAC API you want to connect to. 

#### Return values

Option          | Type      | Description
--------------- | --------- | -------------
`collections`   | `array`   | A list of collections available from the STAC catalog. Is `null` if collections have not been retrieved.
`status`        | `str`     | The status of the request. `"IDLE"` before and after the request is sent or received. `"LOADING"` when the request is in progress. 
`reload`        | `function`| Callback function to trigger a reload of collections.

#### Example

```js
import { StacApi, useCollections } from "stac-react";

function CollectionList() {
  const stacApi = new StacApi("https://planetarycomputer.microsoft.com/api/stac/v1");
  const { collections, status } = useCollections(stacApi);

  if (status === "LOADING") {
    return <p>Loading collections...</p>
  }

  return (
    <>
    {collections ? (
      <ul>
        {collections.map(({ id, title }) => (
          <li key={id}>{title}</li>
        ))}
      </ul>
      <button type="button" onclick={reload}>Update collections</button>
    ): (
      <p>No collections</p>
    )}
    </>
  );
}
```

### useStacApi

Initialises a StacAPI instance. 

#### Initialization

```js
import { useStacApi } from "stac-react";
const { stacApi } = useStacApi("https://planetarycomputer.microsoft.com/api/stac/v1");
```

#### Options

Option          | Type      | Default  | Description
--------------- | --------- | -------- | -------------
`url`           | `string`  |          | Required. The endpoint of the STAC API you want to connect to. 

#### Return values

Option          | Type      | Description
--------------- | --------- | -------------
`stacApi`       | Instance of `StacApi`   | An object that you can pass to `useCollections` and `useStacSearch` hooks. 

#### Example

```jsx
import { useCallback } from "react";
import { useStacApi, useStacSearch } from "stac-react";

import Map from "./map";

function StacComponent() {
  const { stacApi } = useStacApi("https://planetarycomputer.microsoft.com/api/stac/v1");
  const { result } = useStacSearch(stacApi);

  return (
    <>
      <div class="item-list">
        {results && (
          <ul>
            {results.features.map(({ id }) => (
              <li key={id}>{ id }</li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
```

### useStacSearch

Executes a search against a STAC API using the provided search parameters.

#### Initialization

```js
import { useStacSearch } from "stac-react";
const { collections } = useStacSearch(stacApi);
```

#### Options

Option          | Type      | Default  | Description
--------------- | --------- | -------- | -------------
`stacApi`       | Instance of `StacApi`| | Required. The STAC API you want to connect to. 

#### Return values

Option             | Type      | Description
------------------ | --------- | -------------
`submit`           | `function` | Callback to submit the search using the current filter parameters. Excecutes an API call to the specified STAC API.
`bbox`             | `array<number>`   | Array of coordinates `[northWestLon, northWestLat, southEastLon, southEastLat]`, `undefined` if unset.
`setBbox(bbox)`          | `function` | Callback to set `bbox`. `bbox` must be an array of coordinates `[northWestLon, northWestLat, southEastLon, southEastLat]`, or `undefined` to reset.
`collections`      | `array<string>`   | List of select collection IDs included in the search query. `undefined` if unset.
`setCollections(collectionIDs)`   | `function` | Callback to set `collections`. `collectionIDs` must be an `array` of `string` with the IDs of the selection collections, or `undefined` to reset. 
`dateRangeFrom`    | `string` | The from-date of the search query. `undefined` if unset.
`setDateRangeFrom(fromDate)` | `function` | Callback to set `dateRangeFrom`. `fromDate` must be ISO representation of a date, ie. `2022-05-18`, or `undefined` to reset.
`dateRangeTo`      | `string` | The to-date of the search query. `undefined` if unset.
`setDateRangeTo(toDate)`   | `function` | Callback to set `dateRangeto`. `toDate` must be ISO representation of a date, ie. `2022-05-18`, or `undefined` to reset.
`results`          | `object`   | The result of the last search query; a [GeoJSON `FeatureCollection` with additional members](https://github.com/radiantearth/stac-api-spec/blob/v1.0.0-rc.2/fragments/itemcollection/README.md). `undefined` if the search request has not been submitted, or if there was an error. 
`state`            | `string` | The status of the request. `"IDLE"` before and after the request is sent or received. `"LOADING"` when the request is in progress. 
`error`            | [`Error`](#error)   | Error information if the last request was unsuccessful. `undefined` if the last request was successful. 
`nextPage`         | `function` | Callback function to load the next page of results. Is `undefined` if the last page is the currently loaded.
`previousPage`     | `function` | Callback function to load the previous page of results. Is `undefined` if the first page is the currently loaded.

#### Examples

##### Render results

```jsx
import { useCallback } from "react";
import { useStacApi, useStacSearch } from "stac-react";

import Map from "./map";

function StacComponent() {
  const { stacApi } = useStacApi("https://planetarycomputer.microsoft.com/api/stac/v1");
  const { result } = useStacSearch(stacApi);

  return (
    <>
      <div class="item-list">
        {results && (
          <ul>
            {results.features.map(({ id }) => (
              <li key={id}>{ id }</li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
```

##### Handle errors

```jsx
import { useCallback } from "react";
import { useStacApi, useStacSearch } from "stac-react";

import Map from "./map";

function StacComponent() {
  const { stacApi } = useStacApi("https://planetarycomputer.microsoft.com/api/stac/v1");
  const { error, result } = useStacSearch(stacApi);

  return (
    <>
      <div class="item-list">
        {error && <p>{ error.detail }</p>}
        {results && (
          <ul>
            {results.features.map(({ id }) => (
              <li key={id}>{ id }</li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
```

##### Pagination

```jsx
import { useCallback } from "react";
import { useStacApi, useStacSearch } from "stac-react";

import Map from "./map";

function StacComponent() {
  const { stacApi } = useStacApi("https://planetarycomputer.microsoft.com/api/stac/v1");
  const {
    nextPage,
    previousPage,
    result
  } = useStacSearch(stacApi);

  return (
    <>
      <div class="item-list">
        {results && (
          // render results
        )}
      </div>
      <div class="pagination">
        <button type="button" disabled={!previousPage} onClick={previousPage}>
        <button type="button" disabled={!nextPage} onClick={nextPage}>
      </div>
    </>
  )
}
```

##### Set collections

```jsx
import { useCallback } from "react";
import { useStacApi, useStacSearch } from "stac-react";

function StacComponent() {
  const { stacApi } = useStacApi("https://planetarycomputer.microsoft.com/api/stac/v1");
  const { collections } = useCollections(stacApi);
  const { collections: selectedCollections, setCollections, results, submit } = useStacSearch(stacApi);

  const handleChange = useCallback((event) => {
    const { value } = event.target;

    const nextValues = selectedCollections.includes(value)
      ? selectedCollections.filter((v) => v !== value)
      : [ ...selectedCollections, value ];

    setCollections(nextValues);
  }, [selectedCollections, setCollections]);

  return (
    <>
      <div class="query-builder">
        <form onSubmit={submit}>
          <fieldset>
            <legend>Select collections</legend>
            {collections.map(({ id, title }) => (
              <input 
                id={id}
                name="collections"
                value={id}
                type="checkbox"
                onChange={handleChange}
                checked={selectedCollections.includes(id)}
              />
              <label htmlFor={id}>{title}</label>
            ))}
          <fieldset>
          <button type="submit">Search</button>
        </form>
      </div>
    </>
  )
}
```

##### Set bounding box

```jsx
import { useCallback } from "react";
import { useStacApi, useStacSearch } from "stac-react";

import Map from "./map";

function StacComponent() {
  const { stacApi } = useStacApi("https://planetarycomputer.microsoft.com/api/stac/v1");
  const { bbox, setBbox, submit } = useStacSearch(stacApi);

  const handleDrawComplete = useCallback((feature) => {
    setIsBboxDrawEnabled(false);
    
    const { coordinates } = feature.geometry;
    const bbox = [...coordinates[0][0], ...coordinates[0][2]];
    setBbox(bbox);
  }, [setBbox]);

  <Map handleDrawComplete={handleDrawComplete} />
}
```

This example assumes that a `Map` component handles drawing and calls `handleDrawComplete` to set the `bbox` for the search. `handleDrawComplete` is called with a GeoJSON feature representing the bounding box drawn on the map.

##### Set date range

```jsx
import { useCallback } from "react";
import { useStacApi, useStacSearch } from "stac-react";

import Map from "./map";

function StacComponent() {
  const { stacApi } = useStacApi("https://planetarycomputer.microsoft.com/api/stac/v1");
  const {
    dateRangeFrom,
    setDateRangeFrom,
    dateRangeTo,
    setDateRangeTo,
    submit
  } = useStacSearch(stacApi);

  return (
    <>
      <input type="date" name="date_from" onChange={setDateRangeFrom} value={dateRangeFrom} />
      <input type="date" name="date_to" onChange={setDateRangeTo} value={dateRangeTo} />
      <button type="button" onclick={submit}>
    </>
  )
}
```

### Types

#### Error

```js
{
  detail: "Invalid bbox object"
  status: 400,
  statusText: "Bad Request"
}
```

Option             | Type      | Description
------------------ | --------- | -------------
`detail`           | `string` | `object | The error return from the API. Either a `string` or and `object` depending on the response. 
`status`           | `number` | HTTP status code of the response.
`statusText`       | `string` | Status text for the response. 


## Development

Run tests

```sh
yarn test
```

Lint

```sh
yarn lint
```

Build

```
yarn build
```
