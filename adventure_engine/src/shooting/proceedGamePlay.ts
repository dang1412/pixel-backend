import { encodeAttrsArray } from './encodeFuncs'
import { CharacterAttrs, CharacterControl, ShootingGameState, defaultCharacterAttrs, defaultCharacterControl } from './types'

const characterSpeed = 60

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

export function proceedControls(state: ShootingGameState, ctrls: CharacterControl[], speed?: number): [CharacterControl[], number[]] {
  const idCtrlMap: {[id: number]: CharacterControl} = {}
  
  // aggregate ctrls to execute fires, maximum 1 fire per character
  for (const ctrl of ctrls) {
    const id = ctrl.id

    if (idCtrlMap[id]) {
      ctrl.fire = idCtrlMap[id].fire || ctrl.fire
    }
    idCtrlMap[id] = ctrl
  }

  // execute fires TODO
  const updatedCtrls = Object.values(idCtrlMap)

  // execute move
  
  const idSet = new Set<number>()
  for (const ctrl of ctrls) {
    const id = ctrl.id
    const attrs = state.characterAttrsMap[id]
    if (attrs) {
      const moved = proceedAttrsByCtrl(attrs, ctrl, speed)
      if (moved) idSet.add(id)
    }
  }

  return [updatedCtrls, Array.from(idSet)]
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

export function proceedAttrsByCtrl(attrs: CharacterAttrs, ctrl: CharacterControl, speed = characterSpeed): boolean {
  let moved = false
  // move
  if (ctrl.left) {
    attrs.x -= speed
    moved = true
  }
  if (ctrl.up) {
    attrs.y -= speed
    moved = true
  }
  if (ctrl.down) {
    attrs.y += speed
    moved = true
  }
  if (ctrl.right) {
    attrs.x += speed
    moved = true
  }

  if (ctrl.fire) {
    // TODO fire
    // check if alive
    // check if too close to last fire
    // fire
  }

  return moved
}

function proceedGameLoopCharId(state: ShootingGameState, id: number): boolean {
  const attrs = state.characterAttrsMap[id]
  const ctrl = state.characterCtrlMap[id]

  if (attrs && ctrl) {
    let moved = proceedAttrsByCtrl(attrs, ctrl)

    // weapon
    // attrs.weapon = ctrl.weapon
    // angle
    // attrs.angle = ctrl.angle

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
