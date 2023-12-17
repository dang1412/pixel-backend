import { EngineViewport, PixelImage, PixelInfo } from '@/libs/viewport'

export interface AppGlobal {
  engine?: EngineViewport
  pixelMap: Map<number, PixelInfo>
  imageMap: Map<number, PixelImage>
}

export const appGlobal: AppGlobal = {
  pixelMap: new Map(),
  imageMap: new Map()
}
