import { WORLD_WIDTH, getPixelsFromArea } from '../utils'
import { CharacterAttrs } from './types'

interface PixelArea {
  x: number
  y: number
  w: number
  h: number
}

export function getShooterArea(shooter: CharacterAttrs): PixelArea {
  return {
    x: shooter.x - 50,
    y: shooter.y - 50,
    w: 100,
    h: 100
  }
}

export function shooterOnPixels(shooter: CharacterAttrs): number[] {
  const shooterArea = getShooterArea(shooter)
  const pixelArea = getPixelAreaFromObjectArea(shooterArea)

  return getPixelsFromArea(pixelArea, WORLD_WIDTH)
}

export function getPixelAreaFromObjectArea(objArea: PixelArea): PixelArea {
  const { x, y, w, h } = objArea
  const x1 = Math.floor(x / 100)
  const y1 = Math.floor(y / 100)
  const x2 = Math.ceil((x + w) / 100) - 1
  const y2 = Math.ceil((y + h) / 100) - 1

  return { x: x1, y: y1, w: x2 - x1 + 1, h: y2 - y1 + 1 }
}
