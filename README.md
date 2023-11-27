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

## Getting started

Stac-react's hooks must be used inside children of a React context that provides access to the stac-react's core functionality. 

To get started, initialize `StacApiProvider` with the base URL of the STAC catalog. 

```jsx
import { StacApiProvider } from "stac-react";

function StacApp() {
  return (
    <StacApiProvider apiUrl="https://my-stac-api.com">
      // Other components
    </StacApiProvide>
  );
}
```

Now you can start using stac-react hooks in child components of `StacApiProvider`

```jsx
import { StacApiProvider, useCollections } from "stac-react";

function Collections() {
  const { collections } = useCollections();
  
  return (
	  <ul>
	    {collections.collections.map(({ id, title }) => (
	      <li key={id}>{ title }</li>
	    ))}
	  </ul>
    
  )
}

function StacApp() {
  return (
    <StacApiProvider apiUrl="https://my-stac-api.com">
      <Collections />
    </StacApiProvide>
  );
}
```

## API

### StacApiProvider

Provides the React context required for stac-react hooks. 

#### Initialization

```jsx
import { StacApiProvider } from "stac-react";

function StacApp() {
  return (
    <StacApiProvider apiUrl="https://my-stac-api.com">
      // Other components
    </StacApiProvide>
  );
}
```

##### Component Properties

Option          | Type      | Description
--------------- | --------- | -------------
`apiUrl`.       | `string`  | The base url of the STAC catalog.

### useCollections

Retrieves collections from a STAC catalog.

#### Initialization

```js
import { useCollections } from "stac-react";
const { collections } = useCollections();
```

#### Return values

Option          | Type      | Description
--------------- | --------- | -------------
`collections`   | `array`   | A list of collections available from the STAC catalog. Is `null` if collections have not been retrieved.
`state`         | `str`     | The status of the request. `"IDLE"` before and after the request is sent or received. `"LOADING"` when the request is in progress. 
`reload`        | `function`| Callback function to trigger a reload of collections.
`error`         | [`Error`](#error)   | Error information if the last request was unsuccessful. `undefined` if the last request was successful. 

#### Example

```js
import { useCollections } from "stac-react";

function CollectionList() {
  const { collections, state } = useCollections();

  if (state === "LOADING") {
    return <p>Loading collections...</p>
  }

  return (
    <>
    {collections ? (
      <ul>
        {collections.collections.map(({ id, title }) => (
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

### useCollection

Retrieves a single collection from the STAC catalog. 

#### Initialization

```js
import { useCollection } from "stac-react";
const { collection } = useCollection(id);
```

#### Parameters

Option          | Type      | Description
--------------- | --------- | -------------
`id`            | `string`  | The collection ID. 

#### Return values

Option          | Type      | Description
--------------- | --------- | -------------
`collection`    | `object`  | The collection matching the provided ID. Is `null` if collection has not been retrieved.
`state`         | `str`     | The status of the request. `"IDLE"` before and after the request is sent or received. `"LOADING"` when the request is in progress. 
`reload`        | `function`| Callback function to trigger a reload of the collection.
`error`         | [`Error`](#error)   | Error information if the last request was unsuccessful. `undefined` if the last request was successful. 

#### Example

```js
import { useCollection } from "stac-react";

function Collection() {
  const { collection, state } = useCollection("collection_id");

  if (state === "LOADING") {
    return <p>Loading collection...</p>
  }

  return (
    <>
    {collection ? (
      <>
        <h2>{collection.id}</h2>
        <p>{collection.description}</p>
      </>
    ) : (
      <p>Not found</p>
    )}
    </>
  );
}
```

### useItem

Retrieves an item from the STAC catalog. To retrieve an item, provide its full url to the `useItem` hook.

#### Initialization

```js
import { useItem } from "stac-react";
const { item } = useItem(url);
```

#### Parameters

Option          | Type      | Description
--------------- | --------- | -------------
`url`           | `string`  | The URL of the item you want to retrieve.  

#### Return values

Option          | Type      | Description
--------------- | --------- | -------------
`item`          | `object`  | The item matching the provided URL.
`state`         | `str`     | The status of the request. `"IDLE"` before and after the request is sent or received. `"LOADING"` when the request is in progress. 
`reload`        | `function`| Callback function to trigger a reload of the item.
`error`         | [`Error`](#error)   | Error information if the last request was unsuccessful. `undefined` if the last request was successful. 

#### Examples

```js
import { useItem } from "stac-react";

function Item() {
  const { item, state } = useItem("https://stac-catalog.com/items/abc123");

  if (state === "LOADING") {
    return <p>Loading item...</p>
  }

  return (
    <>
    {item ? (
      <>
        <h2>{item.id}</h2>
        <p>{items.description}</p>
      </>
    ) : (
      <p>Not found</p>
    )}
    </>
  );
}
```

### useStacSearch

Executes a search against a STAC API using the provided search parameters.

#### Initialization

```js
import { useStacSearch } from "stac-react";
const { results } = useStacSearch();
```

#### Return values

Option             | Type      | Description
------------------ | --------- | -------------
`submit`           | `function` | Callback to submit the search using the current filter parameters. Excecutes an API call to the specified STAC API.
`ids`              | `array<string>`   | List of item IDs to match in the search, `undefined` if unset.
`setIds(itemIds)`     | `function` | Callback to set `ids`. `itemIds` must be an `array` of `string` with the IDs of the selected items, or `undefined` to reset.
`bbox`             | `array<number>`   | Array of coordinates `[northWestLon, northWestLat, southEastLon, southEastLat]`, `undefined` if unset.
`setBbox(bbox)`    | `function` | Callback to set `bbox`. `bbox` must be an array of coordinates `[northWestLon, northWestLat, southEastLon, southEastLat]`, or `undefined` to reset.
`collections`      | `array<string>`   | List of select collection IDs included in the search query. `undefined` if unset.
`setCollections(collectionIDs)`   | `function` | Callback to set `collections`. `collectionIDs` must be an `array` of `string` with the IDs of the selected collections, or `undefined` to reset. 
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
import { useStacSearch } from "stac-react";

function StacComponent() {
  const { result } = useStacSearch();

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
import { useStacSearch } from "stac-react";

import Map from "./map";

function StacComponent() {
  const { error, result } = useStacSearch();

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
import { useStacSearch } from "stac-react";

function StacComponent() {
  const {
    nextPage,
    previousPage,
    result
  } = useStacSearch();

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
import { useStacSearch } from "stac-react";

function StacComponent() {
  const { collections } = useCollections();
  const { collections: selectedCollections, setCollections, results, submit } = useStacSearch();

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
import { useStacSearch } from "stac-react";

function StacComponent() {
  const { bbox, setBbox, submit } = useStacSearch();

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
import { useStacSearch } from "stac-react";

function StacComponent() {
  const {
    dateRangeFrom,
    setDateRangeFrom,
    dateRangeTo,
    setDateRangeTo,
    submit
  } = useStacSearch();

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
