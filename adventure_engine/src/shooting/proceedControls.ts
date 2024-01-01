import { CharacterAttrs, CharacterControl, ShootingGameState, ShootingGameStateUpdates, defaultCharacterAttrs } from './types'

const characterSpeed = 6

export function proceedControls(state: ShootingGameState, ctrls: CharacterControl[]): ShootingGameStateUpdates {
  const updateIdSet = new Set<number>()
  const fireIdSet = new Set<number>()
  const deadIdSet = new Set<number>()
  for (const ctrl of ctrls) {
    proceedControl(state, ctrl, updateIdSet, fireIdSet, deadIdSet)
  }

  const updateIds = Array.from(updateIdSet)
  const updates: CharacterAttrs[] = updateIds.map(id => state.characterAttrsMap[id])

  const fireIds = Array.from(fireIdSet)
  const deadIds = Array.from(deadIdSet)

  return { updateIds, updates, fireIds, deadIds }
}

function proceedControl(state: ShootingGameState, ctrl: CharacterControl, updateIdSet: Set<number>, fireIdSet: Set<number>, deadIdSet: Set<number>) {
  const id = ctrl.id
  const attrs = state.characterAttrsMap[id] || { hp: 100, angle: -90, weapon: 1, x: 50, y: 50 }
  state.characterAttrsMap[id] = attrs

  // move
  if (ctrl.l) {
    attrs.x -= characterSpeed
  }
  if (ctrl.u) {
    attrs.y -= characterSpeed
  }
  if (ctrl.d) {
    attrs.y += characterSpeed
  }
  if (ctrl.r) {
    attrs.x += characterSpeed
  }

  // weapon
  attrs.weapon = ctrl.w
  // angle
  attrs.angle = ctrl.a

  if (ctrl.f) {
    // TODO fire
    // check if alive
    // check if too close to last fire
    fireIdSet.add(id)
  }

  updateIdSet.add(id)
}
