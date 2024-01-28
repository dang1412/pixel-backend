import { PixelArea, WORLD_WIDTH, getPixelsFromArea } from '../utils'
import { ShootingGameState } from './types'

const areas: PixelArea[] = [
  {x: 41, y: 33, w: 2, h: 2},
  {x: 37, y: 42, w: 5, h: 3},
  {x: 56, y: 34, w: 8, h: 3},
  {x: 48, y: 48, w: 3, h: 3},
  {x: 37, y: 53, w: 4, h: 4},
  {x: 60, y: 48, w: 6, h: 4},
  {x: 49, y: 39, w: 6, h: 3},
  {x: 50, y: 60, w: 5, h: 3},
]

export function initGameState(): ShootingGameState {
  const buildingBlocks = {}

  for (const area of areas) {
    const pixels = getPixelsFromArea(area, WORLD_WIDTH)
    for (const pixel of pixels) buildingBlocks[pixel] = true
  }

  return {
    characterAttrsMap: {},
    characterCtrlMap: {},
    characterTarget: {},
    characterTypes: {},
    positionCharactersMap: {},
    buildingBlocks,
  }
}