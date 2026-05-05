import type { Geometry } from 'geojson';
import type { GenericObject } from '.';

export type Bbox = [number, number, number, number];
export type IdList = string[];
export type CollectionIdList = string[];
export type DateRange = {
  from?: string;
  to?: string;
};
export type Sortby = {
  field: string;
  direction: 'asc' | 'desc';
};

export type SearchPayload = {
  ids?: IdList;
  bbox?: Bbox;
  collections?: CollectionIdList;
  dateRange?: DateRange;
  sortby?: Sortby[];
};

/**
 * Extended search payload that includes both the base SearchPayload structure
 * and additional properties used in API requests.
 */
export type SearchRequestPayload = SearchPayload & {
  /** Datetime string in ISO 8601 format (transformed from dateRange) */
  datetime?: string;
  /** Maximum number of results to return */
  limit?: number;
  /** Pagination token for cursor-based pagination */
  token?: string;
  /** Page number for offset-based pagination */
  page?: number;
  /** Flag indicating if this payload should be merged with current search params */
  merge?: boolean;
};

/**
 * Type for fetch requests used in useStacSearch hook
 */
export type FetchRequest =
  | {
      type: 'search';
      payload: SearchRequestPayload;
      headers?: Record<string, string>;
    }
  | {
      type: 'get';
      url: string;
    };

export type LinkBody = SearchPayload & {
  merge?: boolean;
};

export type SearchResponse = {
  type: 'FeatureCollection';
  features: Item[];
  links: Link[];
};

export type Link = {
  href: string;
  rel: string;
  type?: string;
  hreflang?: string;
  title?: string;
  length?: number;
  method?: string;
  headers?: GenericObject;
  body?: LinkBody;
  merge?: boolean;
};

export type ItemAsset = {
  href: string;
  title?: string;
  description?: string;
  type?: string;
  roles?: string[];
};

export type Item = {
  id: string;
  bbox: Bbox;
  geometry: Geometry;
  type: 'Feature';
  properties: GenericObject;
  links: Link[];
  assets: Record<string, ItemAsset>;
};

type Role = 'licensor' | 'producer' | 'processor' | 'host';

export type Provider = {
  name: string;
  description?: string;
  roles?: Role[];
  url: string;
};

type SpatialExtent = {
  bbox: number[][];
};

type TemporalExtent = {
  interval: string | null[][];
};

export type Extent = {
  spatial: SpatialExtent;
  temporal: TemporalExtent;
};

export type Collection = {
  // Must be set to `Collection` to be a valid Collection.
  type: 'Collection';
  // The STAC version the Collection implements.
  stac_version: string;
  // A list of extension identifiers the Collection implements.
  stac_extensions?: string[];
  // Identifier for the Collection that is unique across all collections in the root catalog.
  id: string;
  // short descriptive one-line title for the Collection.
  title?: string;
  // Detailed multi-line description to fully explain the Collection. CommonMark 0.29 syntax MAY be used for rich text representation.
  description: string;
  // List of keywords describing the Collection.
  keywords?: string[];
  // License(s) of the data collection as SPDX License identifier, SPDX License expression, or `other`.
  license: string;
  // A list of providers, which may include all organizations capturing or processing the data or the hosting provider.
  providers?: Provider[];
  // Spatial and temporal extents.
  extent: Extent;
  // STRONGLY RECOMMENDED. A map of property summaries, either a set of values, a range of values or a JSON Schema.
  summaries?: Record<string, unknown>;
  // A list of references to other documents.
  links: Link[];
  // Dictionary of asset objects that can be downloaded, each with a unique key.
  assets?: Record<string, ItemAsset>;
  // A dictionary of assets that can be found in member Items.
  item_assets?: Record<string, Omit<ItemAsset, 'href'>>;
};

export type CollectionsResponse = {
  collections: Collection[];
  links: Link[];
};
