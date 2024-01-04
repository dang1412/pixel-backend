import { getPixelIndex } from './getPixelIndex'

export interface PixelArea {
  x: number, y: number, w: number, h: number
}

export function getPixelsFromArea(area: PixelArea, mapWidth: number): number[] {
  const indexes: number[] = []

  for (let j = 0; j < area.h; j++) {
    const index = getPixelIndex(area.x, area.y + j, mapWidth)
    for (let i = 0; i < area.w; i++) {
      indexes.push(index + i)
    }
  }

  return indexes
}