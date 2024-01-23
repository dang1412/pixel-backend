
// const WORLD_WIDTH = 10000
// const WORLD_HEIGHT = 10000

import { getPixelIndex } from '../utils'
import { WORLD_HEIGHT, WORLD_WIDTH } from '../utils/constants'
import { ShootingGameState } from './types'

function angleEqual(angle: number, i: number): boolean {
  return Math.round(angle * 100) === Math.round(i * Math.PI * 100)
}

// tan(angle) = dy / dx
function distanceToVerticalX(x: number, y: number, angle: number, x1: number): number {
  const y1 = y + Math.tan(angle) * (x1 - x)

  return Math.abs(x1 - x) + Math.abs(y1 - y)
}

function distanceToHorizontalY(x: number, y: number, angle: number, y1: number): number {
  const x1 = x + (y1 - y) / Math.tan(angle)

  return Math.abs(x1 - x) + Math.abs(y1 - y)
}

export function proceedShootLinePixels(x: number, y: number, angle: number, proceedPixel: (px: number, py: number) => boolean) {
  // find direction of x, y: 1, 0, -1
  const dirx = angleEqual(angle, 0.5) || angleEqual(angle, -0.5) ? 0: (angle > - Math.PI/2 && angle < Math.PI/2) ? 1 : -1
  const diry = angleEqual(angle, 0) || angleEqual(angle, 1) || angleEqual(angle, -1) ? 0 : angle > 0 ? 1 : -1

  let px = Math.floor(x)  // pixel x
  let py = Math.floor(y)  // pixel y

  // vertical X, horizontal Y
  let vx = dirx <= 0 ? px : px + 1
  let hy = diry <= 0 ? py : py + 1

  // distance to the next vertical line, horizon line
  let dvx = dirx !== 0 ? distanceToVerticalX(x, y, angle, vx) : Infinity
  let dhy = diry !== 0 ? distanceToHorizontalY(x, y, angle, hy) : Infinity

  while (vx >= 0 && vx <= WORLD_WIDTH && hy >= 0 && hy <= WORLD_HEIGHT) {
    const iscontinue = proceedPixel(px, py)
    if (!iscontinue) break
    if (dvx <= dhy) {
      px += dirx
      vx += dirx
      dvx = distanceToVerticalX(x, y, angle, vx)
    } else {
      py += diry
      hy += diry
      dhy = distanceToHorizontalY(x, y, angle, hy)
    }
  }
}

/**
 * World Boundary rectangle (x, y, width, height) = (0, 0, 10000, 10000)
 * @param x 
 * @param y 
 * @param angle (in radian)
 * @returns 
 */
export function findBoundaryIntersectPoint(x: number, y: number, angle: number): [number, number] {

  // straight to the right
  if (angleEqual(angle, 0)) {
    return [WORLD_WIDTH, y]
  }

  // straight to the left
  if (angleEqual(angle, 1) || angleEqual(angle, -1)) {
    return [0, y]
  }

  // straight up
  if (angleEqual(angle, -0.5)) {
    return [x, 0]
  }

  // straight down
  if (angleEqual(angle, 0.5)) {
    return [x, WORLD_HEIGHT]
  }

  // find intersect with horizon line y = 0 or y = WORLD_HEIGHT
  const boundaryHorizonY = angle > 0 ? WORLD_HEIGHT : 0
  const boundaryHorizonX = (boundaryHorizonY - y) / Math.tan(angle) + x

  if (boundaryHorizonX >= 0 && boundaryHorizonX <= WORLD_WIDTH) return [boundaryHorizonX, boundaryHorizonY]

  // find intersect with vertical line x = 0 or x = WORLD_WIDTH
  const boundaryVerticalX = (angle > - Math.PI / 2 && angle < Math.PI / 2) ? WORLD_WIDTH : 0
  const boundaryVerticalY = (boundaryVerticalX - x) * Math.tan(angle) + y

  return [boundaryVerticalX, boundaryVerticalY]
}

export function findPointX1(x: number, y: number, ) {}

function intersect(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): [number, number] | null {
  var denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  if (denominator === 0) {
    return null
  }
  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
      return null
  }
  let x = x1 + ua * (x2 - x1)
  let y = y1 + ua * (y2 - y1)
  return [x, y]
}

function shootHitObject(x: number, y: number, bx: number, by: number, obj: [number, number, number, number]): [number, number, number] | null {
  const [ox1, oy1, w, h] = obj
  const [ox2, oy2] = [ox1 + w, oy1 + h]

  // return null if (x, y) inside object
  if (x >= ox1 && x <= ox2 && y >= oy1 && y <= oy2) return null

  const segments = [
    [ox1, oy1, ox2, oy1],
    [ox2, oy1, ox2, oy2],
    [ox2, oy2, ox1, oy2],
    [ox1, oy2, ox1, oy1]
  ]

  let hitPoint: [number, number, number] | null = null
  for (let seg of segments) {
    const intersectP = intersect(x, y, bx, by, seg[0], seg[1], seg[2], seg[3])

    if (intersectP) {
      const distance = Math.abs(intersectP[0] - x) + Math.abs(intersectP[1] - y)
      if (!hitPoint || hitPoint[2] > distance) {
        hitPoint = [intersectP[0], intersectP[1], distance]
      }
    }
  }

  return hitPoint
}

/**
 * 
 * @param x 
 * @param y 
 * @param angle 
 * @param objs [id, x, y, w, h][]
 * @returns [id, x, y] of the first hit
 */
export function shootFirstHitObject(
  state: ShootingGameState,
  id: number,
  angle: number,
): [number, number, number] | null {
  const attrs = state.characterAttrsMap[id]
  if (!attrs) return null

  const [x, y] = [attrs.x / 100, attrs.y / 100]
  const [bx, by] = findBoundaryIntersectPoint(x, y, angle)
  let firstHit: [number, number, number] = [0, bx, by]
  let distance = Infinity
  proceedShootLinePixels(x, y, angle, (px, py) => {
    const pixel = getPixelIndex(px, py, WORLD_WIDTH)

    const shooterIds = state.positionCharactersMap[pixel] || []
    let objs = state.buildingBlocks[pixel] ? [[0, px, py, 1, 1]]
      : shooterIds.map(_id => _id !== id && state.characterAttrsMap[_id] ? [_id, (state.characterAttrsMap[_id].x - 50)/100, (state.characterAttrsMap[_id].y - 50)/100, 1, 1] : null)

    for (const obj of objs) if (obj) {
      const hitP = shootHitObject(x, y, bx, by, obj.slice(1) as [number, number, number, number])
      if (hitP && distance > hitP[2]) {
        // [id, x, y]
        firstHit = [obj[0], hitP[0], hitP[1]]
        distance = hitP[2]
        // found the hit, stop the shoot line
        return false
      } else {

      }
    }

    return true
  })

  return firstHit
}
