
const WORLD_WIDTH = 10000
const WORLD_HEIGHT = 10000

function angleEqual(angle: number, i: number): boolean {
  return Math.round(angle * 100) === Math.round(i * Math.PI * 100)
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

function shootHitObject(x: number, y: number, angle: number, obj: [number, number, number, number]): [number, number, number] | null {
  const [bx, by] = findBoundaryIntersectPoint(x, y, angle)

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
        hitPoint = [...intersectP, distance]
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
 * @param objs 
 * @returns [index, x, y] of the first hit
 */
export function shootFirstHitObject(x: number, y: number, angle: number, objs: [number, number, number, number][]): [number, number, number] | null {
  let firstHit: [number, number, number] | null = null
  let distance = 0
  for (let i = 0; i < objs.length; i++) {
    const obj = objs[i]
    const hitP = shootHitObject(x, y, angle, obj)
    if (hitP && (!firstHit || distance > hitP[2])) {
      // [index, x, y]
      firstHit = [i, hitP[0], hitP[1]]
      distance = hitP[2]
    }
  }

  return firstHit
}
