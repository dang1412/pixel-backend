import { PixelArea } from '../types'
import { getPixelIndex } from './getPixelIndex'

export function getPixelIndexesFromArea(area: PixelArea, mapWidth: number): number[] {
  const indexes: number[] = []

  for (let j = 0; j < area.h; j++) {
    const index = getPixelIndex(area.x, area.y + j, mapWidth)
    for (let i = 0; i < area.w; i++) {
      indexes.push(index + i)
    }
  }

  return indexes
}