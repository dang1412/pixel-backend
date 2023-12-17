export interface PixelPoint {
  x: number,
  y: number
}

export interface PixelArea {
  x: number
  y: number
  w: number
  h: number
}

export interface PixelImage {
  area: PixelArea
  imageUrl: string
  title: string
  subtitle: string
  link: string
  subImages?: PixelImage[]
  // metaCid?: string  // lazy load meta info
  owner?: string
}

export interface ImageMeta {
  title: string
  subtitle: string
  link: string
}

export interface PixelInfo {
  pixelId: number
  owner: string
  dateMinted: number
  price: number
}
