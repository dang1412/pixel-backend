import { ShootingGameState } from '../types'
import { GAME_LOOP_TIME, SHOOTER_SPEED } from './constants'
import { canMove, setMove } from './utils'

export function proceedMoveTarget(state: ShootingGameState): number[] {
  const movedIds: number[] = []

  const ids = Object.keys(state.characterTarget)
  for (const idstr of ids) {
    const id = Number(idstr)
    const [tx, ty] = state.characterTarget[id]
    const distance = SHOOTER_SPEED * GAME_LOOP_TIME * 100
    const attrs = state.characterAttrsMap[id]
    const {x, y} = attrs
    const [nx, ny] = calculateMoveToTarget(x, y, tx, ty, distance)

    // check if can move nx, ny
    if (canMove(state, id, nx, ny)) {
      // update if can move
      setMove(attrs, nx, ny, state.positionCharactersMap)
      movedIds.push(id)
    } else {
      // delete from target
      delete state.characterTarget[id]
    }
  }

  return movedIds
}

function calDistance(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

function calculateMoveToTarget(x: number, y: number, tx: number, ty: number, distance: number): [number, number] {
  const d1 = calDistance(x, y, tx, ty)
  if (d1 <= distance) {
    return [tx, ty]
  }

  const angle = Math.atan2(ty - y, tx - x)
  const dy = Math.sin(angle) * distance
  const dx = Math.cos(angle) * distance

  return [x + dx, y + dy]
}