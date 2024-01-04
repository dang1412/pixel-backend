import { encodeAttrsArray } from './encodeFuncs'
import { CharacterAttrs, CharacterControl, ShootingGameState, defaultCharacterAttrs, defaultCharacterControl } from './types'

const characterSpeed = 80

export function ctrlEqual(c1: CharacterControl, c2: CharacterControl): boolean {
  if (!c1 || !c2) return false
  return 1
    // && c1.angle === c2.angle
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

export function proceedGameLoop(state: ShootingGameState): number[] {
  const ids: number[] = []
  for (const key of Object.keys(state.characterAttrsMap)) {
    const id = Number(key)
    const moved = proceedGameLoopCharId(state, id)
    if (moved) ids.push(id)
  }

  return ids
}

function proceedGameLoopCharId(state: ShootingGameState, id: number): boolean {
  const attrs = state.characterAttrsMap[id]
  const ctrl = state.characterCtrlMap[id]

  if (attrs && ctrl) {
    let moved = false
    // move
    if (ctrl.left) {
      attrs.x -= characterSpeed
      moved = true
    }
    if (ctrl.up) {
      attrs.y -= characterSpeed
      moved = true
    }
    if (ctrl.down) {
      attrs.y += characterSpeed
      moved = true
    }
    if (ctrl.right) {
      attrs.x += characterSpeed
      moved = true
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

    return moved
  }

  return false
}

export function addShooter(state: ShootingGameState, x: number, y: number): CharacterAttrs {
  let id = 1
  while (state.characterAttrsMap[id]) id++

  const attrs: CharacterAttrs = { id, hp: 100, x, y }
  state.characterAttrsMap[id] = attrs
  state.characterCtrlMap[id] = Object.assign({}, defaultCharacterControl, { id })

  return attrs
}

export function encodeAllShooters(state: ShootingGameState, ids?: number[]): ArrayBuffer {
  const attrsArr = ids ? getAttrsArr(state, ids) : Object.values(state.characterAttrsMap)
  const data = encodeAttrsArray(attrsArr)

  return data
}

function getAttrsArr(state: ShootingGameState, ids: number[]): CharacterAttrs[] {
  const attrsArr = ids.map(id => state.characterAttrsMap[id])

  return attrsArr
}
