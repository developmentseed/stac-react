import type { Geometry } from 'geojson';
import type { GenericObject } from '.';

export type Bbox = [number, number, number, number];
export type IdList = string[];
export type CollectionIdList = string[];
export type DateRange = {
  from?: string,
  to?: string
}

export type SearchPayload = {
  ids?: IdList,
  bbox?: Bbox,
  collections?: CollectionIdList,
  dateRange?: DateRange,
}

export type LinkBody = SearchPayload & {
  merge?: boolean
}

export type SearchResponse = {
  type: 'FeatureCollection'
  features: Item[]
  links: Link[]
}

export type Link = {
  href: string
  rel: string
  type?: string
  hreflang?: string
  title?: string
  length?: number
  method?: string
  headers?: GenericObject
  body?: LinkBody
  merge?: boolean
}

export type ItemAsset = {
  href: string
  title?: string
  description?: string
  type?: string
  roles?: string[]
}

export type Item = {
  id: string,
  bbox: Bbox,
  geometry: Geometry,
  type: 'Feature'
  properties: GenericObject
  links: Link[]
  assets: ItemAsset[]
}

type Role = 'licensor' | 'producer' | 'processor' | 'host';

export type Provider = {
  name: string,
  description?: string,
  roles?: Role[],
  url: string
}

type SpatialExtent = {
  bbox: number[][]
}

type TemporalExtent = {
  interval: string | null[][]
}

export type Extent = {
  spatial: SpatialExtent,
  temporal: TemporalExtent,
}

export type Collection = {
  type: 'Collection',
  stac_version: string,
  stac_extensions?: string[],
  id: string,
  title?: string,
  keywords?: string[],
  license: string,
  providers: Provider[],
  extent: Extent,
  links: Link[]
  assets: GenericObject,
}

export type CollectionsResponse = {
  collections: Collection[],
  links: Link[]
}
