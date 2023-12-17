import { PixelImage } from '../viewport'
import { appGlobal } from './globals'

export function getImagesFromPixels(pixelIds: number[]): PixelImage[] {
  const images = pixelIds.map(pixel => appGlobal.imageMap.get(pixel)).filter(img => !!img) as PixelImage[]

  return images
}
