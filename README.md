# stac-react

React hooks to build front-end applications for STAC APIs. 

> **Note:**
> stac-react is in early development, the API will likely break in future versions. 

## Installation

TBD


## API

### StacApi

Initialises a STAC-API client. Pass the instance to the React hooks documented below.

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
`status`        | `str` .   | The status of the request. `IDLE` before and after the request is sent or received. `LOADING` when the request is in progress. 
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

### useStacSearch

Executes a search against a STAC API using the provided search parameters.

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

Option             | Type      | Description
------------------ | --------- | -------------
`submit`           | `function` | Callback to submit the search using the current filter parameters. Excecutes an API call to the specified STAC API.
`bbox`             | `array`   | Array of coordinates `[northWestLon, northWestLat, southEastLon, southEastLat]`, `undefined` if unset.
`setBbox(bbox)`          | `function` | Callback to set `bbox`. `bbox` must be an array of coordinates `[northWestLon, northWestLat, southEastLon, southEastLat]`, or `undefined` to reset.
`collections`      | `array<string>`   | List of select collection IDs included in the search query. `undefined` if unset.
`setCollections(collectionIDs)`   | `function` | Callback to set `collections`. `collectionIDs` must be an `array` of `string` with the IDs of the selection collections, or `undefined` to reset. 
`dateRangeFrom`    | `string` | The from-date of the search query. `undefined` if unset.
`setDateRangeFrom(fromDate)` | `function` | Callback to set `dateRangeFrom`. `fromDate` must be ISO representation of a date, ie. `2022-05-18`, or `undefined` to reset.
`dateRangeTo`      | `string` | The to-date of the search query. `undefined` if unset.
`setDateRangeTo(toDate)`   | `function` | Callback to set `dateRangeto`. `toDate` must be ISO representation of a date, ie. `2022-05-18`, or `undefined` to reset.
`results`          | `object`   | The result of the last search query; a [GeoJSON `FeatureCollection` with additional members](https://github.com/radiantearth/stac-api-spec/blob/v1.0.0-rc.2/fragments/itemcollection/README.md). `undefined` if the search request has not been submitted, or if there was an error. 
`state`            | `string` | The status of the request. `IDLE` before and after the request is sent or received. `LOADING` when the request is in progress. 
`error`            | [`Error`](#error)   | Error information if the last request was unsuccessful. `undefined` if the last request was successful. 
`nextPage`         | `function` | Callback function to load the next page of results. Is `undefined` if the last page is the currently loaded.
`previousPage`     | `function` | Callback function to load the previous page of results. Is `undefined` if the first page is the currently loaded.

#### Examples

##### Set bounding box

##### Set collections

##### Set date range

##### Pagination


### Types

#### Error

```js
{
  detail: "Invalid bbox object"
  status: 400,
  statusText: "Bad Request"
}
```

```
Option             | Type      | Description
------------------ | --------- | -------------
`detail`           | `string` | `object | The error return from the API. Either a `string` or and `object` depending on the response. 
`status`           | `number` | HTTP status code of the response.
`statusText`       | `string` | Status text for the response. 
```
