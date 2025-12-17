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
  assets: ItemAsset[];
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
  type: 'Collection';
  stac_version: string;
  stac_extensions?: string[];
  id: string;
  title?: string;
  keywords?: string[];
  license: string;
  providers: Provider[];
  extent: Extent;
  links: Link[];
  assets: GenericObject;
};

export type CollectionsResponse = {
  collections: Collection[];
  links: Link[];
};
