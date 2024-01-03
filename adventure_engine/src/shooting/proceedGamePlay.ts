import { encodeAttrsArray } from './encodeFuncs'
import { CharacterControl, ShootingGameState, defaultCharacterAttrs, defaultCharacterControl } from './types'

const characterSpeed = 6

export function ctrlEqual(c1: CharacterControl, c2: CharacterControl): boolean {
  if (!c1 || !c2) return false
  return c1.angle === c2.angle
    && c1.down === c2.down
    && c1.fire === c2.fire
    && c1.id === c2.id
    && c1.left === c2.left
    && c1.right === c2.right
    && c1.up === c2.up
    && c1.weapon === c2.weapon
}

export function proceedControls(state: ShootingGameState, ctrls: CharacterControl[]): CharacterControl[] {
  const idCtrlMap: {[id: number]: CharacterControl} = {}

  for (const ctrl of ctrls) {
    const id = ctrl.id
    if (!ctrlEqual(state.characterCtrlMap[id], ctrl)) {
      // update ctrl
      state.characterCtrlMap[id] = ctrl
      idCtrlMap[id] = ctrl
    }
  }

  return Object.values(idCtrlMap)
}

export function proceedGameLoop(state: ShootingGameState) {
  for (const id of Object.keys(state.characterAttrsMap)) {
    proceedGameLoopCharId(state, Number(id))
  }
}

function proceedGameLoopCharId(state: ShootingGameState, id: number) {
  const attrs = state.characterAttrsMap[id]
  const ctrl = state.characterCtrlMap[id]
  if (attrs && ctrl) {
    // move
    if (ctrl.left) {
      attrs.x -= characterSpeed
    }
    if (ctrl.up) {
      attrs.y -= characterSpeed
    }
    if (ctrl.down) {
      attrs.y += characterSpeed
    }
    if (ctrl.right) {
      attrs.x += characterSpeed
    }

    // weapon
    // attrs.weapon = ctrl.weapon
    // angle
    // attrs.angle = ctrl.angle

    if (ctrl.fire) {
      // TODO fire
      // check if alive
      // check if too close to last fire
      // fire
    }
  }
}

export function addShooter(state: ShootingGameState, x: number, y: number) {
  let id = 1
  while (state.characterAttrsMap[id]) id++

  state.characterAttrsMap[id] = { id, hp: 100, x, y }
  state.characterCtrlMap[id] = Object.assign({}, defaultCharacterControl, { id })
}

export function encodeAllShooters(state: ShootingGameState): ArrayBuffer {
  const attrsArr = Object.values(state.characterAttrsMap)
  const data = encodeAttrsArray(attrsArr)

  return data
}
