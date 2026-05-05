import type { GenericObject } from '.';
import type { StacItem, StacLink, StacCollection } from 'stac-ts';

// Re-export stac-ts types so consumers can rely on stac-react as a single
// import surface for STAC documents.
export type {
  StacAsset,
  StacCatalog,
  StacCollection,
  StacExtensions,
  StacItem,
  StacLink,
  StacProvider,
  StacRoles,
  StacVersion,
} from 'stac-ts';

// ---------------------------------------------------------------------------
// stac-react-specific search input types
// ---------------------------------------------------------------------------

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

/**
 * Body shape for STAC pagination links. Links served as `rel: next` may
 * carry a structured `body` describing the next-page POST payload; this
 * extends SearchPayload with a `merge` flag so the consumer knows whether
 * to merge with the current search params.
 */
export type LinkBody = SearchPayload & {
  merge?: boolean;
};

/**
 * Pagination-aware extension of StacLink. STAC servers MAY add a typed
 * `body` (per OGC API STAC pagination), plus stac-react surfaces `method`,
 * `headers`, and `merge` for the consumer hooks. The base StacLink index
 * signature already permits these fields; this type just gives them
 * static types where stac-react reads them.
 */
export type Link = StacLink & {
  hreflang?: string;
  length?: number;
  method?: string;
  headers?: GenericObject;
  body?: LinkBody;
  merge?: boolean;
};

// ---------------------------------------------------------------------------
// stac-react response wrappers (around stac-ts documents)
// ---------------------------------------------------------------------------

export type SearchResponse = {
  type: 'FeatureCollection';
  features: StacItem[];
  links: Link[];
};

export type CollectionsResponse = {
  collections: StacCollection[];
  links: Link[];
};
