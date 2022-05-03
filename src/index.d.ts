type GenericObject = {
  [key: string]: any  // eslint-disable-line @typescript-eslint/no-explicit-any
}

type Bbox = [number, number, number, number];

type Link = {
  href: string
  rel: string
  type?: string
  hreflang?: string
  title?: string
  length?: number
  method?: string
  headers?: GenericObject
  body?: GenericObject
  merge?: boolean
}

type ItemAsset = {
  href: string
  title?: string
  description?: string
  type?: string
  roles?: string[]
}

type Item = {
  id: string,
  bbox: Bbox,
  geometry: Geometry,
  type: 'Feature'
  properties: GenericObject
  links: Link[]
  assets: ItemAsset[]
}