import { PixelArea, WORLD_WIDTH, getPixelsFromArea } from '../utils'
import { CharacterAttrs } from './types'

export function getShooterArea(shooter: CharacterAttrs): PixelArea {
  return {
    x: (shooter.x - 50) / 100,
    y: (shooter.y - 50) / 100,
    w: 1,
    h: 1
  }
}

export function shooterOnPixels(shooter: CharacterAttrs): number[] {
  const shooterArea = getShooterArea(shooter)
  const pixelArea = getPixelAreaFromObjectArea(shooterArea)

  return getPixelsFromArea(pixelArea, WORLD_WIDTH)
}

export function getPixelAreaFromObjectArea(objArea: PixelArea): PixelArea {
  const { x, y, w, h } = objArea
  const x1 = Math.floor(x)
  const y1 = Math.floor(y)
  const x2 = Math.ceil(x + w) - 1
  const y2 = Math.ceil(y + h) - 1

  return { x: x1, y: y1, w: x2 - x1 + 1, h: y2 - y1 + 1 }
}

export function findUniqueElements(arr1: number[], arr2: number[]): [number[], number[]] {
  const set1 = new Set(arr1)
  const set2 = new Set(arr2)

  const uniqueToSet1 = arr1.filter(a => !set2.has(a))
  const uniqueToSet2 = arr2.filter(a => !set1.has(a))

  return [uniqueToSet1, uniqueToSet2]
}
