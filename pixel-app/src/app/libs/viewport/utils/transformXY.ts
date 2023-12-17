import { PIXEL_EXPAND_X, PIXEL_EXPAND_Y, WORLD_WIDTH } from '../constants'
import { PixelArea } from '../types'
import { getPixelIndex, getPixelXYFromIndex } from './getPixelIndex'

export function getSubPixel(areaInParent: PixelArea, x: number, y: number): [number, number] {
  const px = areaInParent.x + Math.floor(x / PIXEL_EXPAND_X)
  const py = areaInParent.y + Math.floor(y / PIXEL_EXPAND_Y)
  const parentIndex = getPixelIndex(px, py, WORLD_WIDTH)

  const subx = x % PIXEL_EXPAND_X
  const suby = y % PIXEL_EXPAND_Y
  const subIndex = getPixelIndex(subx, suby, PIXEL_EXPAND_X)

  return [parentIndex, subIndex]
}

export function getXYInAreaFromSubpixel(area: PixelArea, pixel: number, subpixel: number): [number, number] {
  const [px, py] = getPixelXYFromIndex(pixel, WORLD_WIDTH)
  const [dx, dy] = getPixelXYFromIndex(subpixel, PIXEL_EXPAND_X)

  const x = (px - area.x) * PIXEL_EXPAND_X + dx
  const y = (py - area.y) * PIXEL_EXPAND_Y + dy

  return [x, y]
}
