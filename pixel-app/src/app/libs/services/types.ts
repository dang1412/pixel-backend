// export interface ImageMeta {
//   title: string
//   subtitle: string
//   link: string
// }

// export interface ApiPixel {
//   pixelId: string
//   owner: string
//   dateMinted: string
//   price?: string
// }

export type ApiPixel = [string, string]

export interface ApiPixelImage {
  pixelId: string
  size_: [string, string]
  imageCid: string
  metaCid: string
  subPixelId?: string
}

export interface IIPFSService {
  add: (data: Blob | string) => Promise<string>
}
