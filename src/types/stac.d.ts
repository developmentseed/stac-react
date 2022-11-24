import type { Geometry } from 'geojson';
import type { GenericObject } from '.';

export type Bbox = [number, number, number, number];
export type CollectionIdList = string[];
export type DateRange = {
  from?: string,
  to?: string
}

export type SearchPayload = {
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
