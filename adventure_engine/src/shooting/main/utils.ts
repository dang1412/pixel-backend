import { PixelArea, WORLD_HEIGHT, WORLD_WIDTH, getPixelsFromArea } from '../../utils'
import { CharacterAttrs, ShootingGameState } from '../types'

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

export function isCollide(o1: PixelArea, o2: PixelArea): boolean {
  if (o1.x > o2.x + o2.w || o2.x > o1.x + o1.w) return false
  if (o1.y > o2.y + o2.h || o2.y > o1.y + o1.h) return false

  return true
}

export function canMove(state: ShootingGameState, id: number, x: number, y: number): boolean {
  // check out of the map
  if (x < 0 || x > WORLD_WIDTH * 100 || y < 0 || y > WORLD_HEIGHT * 100) return false

  const movePixels = shooterOnPixels({id, hp: 0, x, y})

  // check if collide with building
  for (const pixel of movePixels) {
    if (state.buildingBlocks[pixel]) return false
  }

  // check if collide with other shooters
  const shooterArea = getShooterArea({id, hp: 0, x, y})

  const potentialCollideIds = movePixels.map(pixel => state.positionCharactersMap[pixel] || []).flat()
  for (let potentialId of potentialCollideIds) if (potentialId !== id) {
    const checkArea = getShooterArea(state.characterAttrsMap[potentialId])
    if (isCollide(shooterArea, checkArea)) return false
  }

  return true
}

/**
 * This function is also used by client, to update shooter's position from server
 * 
 * @param attrs 
 * @param x 
 * @param y 
 * @param positionCharactersMap 
 */
export function setMove(attrs: CharacterAttrs, x: number, y: number, positionCharactersMap: {[id: number]: number[]}) {
  const beforeMovePixels = shooterOnPixels(attrs)
  const afterMovePixels = shooterOnPixels({x, y, hp: 0, id: 0})
  const [oldPixels, newPixels] = findUniqueElements(beforeMovePixels, afterMovePixels)

  // move
  attrs.x = x
  attrs.y = y

  // remove from old pixels
  removeFromPixels(positionCharactersMap, attrs.id, oldPixels)

  // add to new pixels
  addToPixels(positionCharactersMap, attrs.id, newPixels)
}

/**
 * 
 * @param positionCharactersMap 
 * @param id 
 * @param pixels 
 */
export function removeFromPixels(positionCharactersMap: {[id: number]: number[]}, id: number, pixels: number[]) {
  for (const pixel of pixels) if (positionCharactersMap[pixel]) {
    positionCharactersMap[pixel] = positionCharactersMap[pixel].filter(_id => _id !== id)
    if (positionCharactersMap[pixel].length === 0) {
      delete positionCharactersMap[pixel]
    }
  }
}

/**
 * 
 * @param positionCharactersMap 
 * @param id 
 * @param pixels 
 */
export function addToPixels(positionCharactersMap: {[id: number]: number[]}, id: number, pixels: number[]) {
  for (const pixel of pixels) {
    if (!positionCharactersMap[pixel]) positionCharactersMap[pixel] = [id]
    else positionCharactersMap[pixel].push(id)
  }
}
