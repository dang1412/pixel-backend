import { shootFirstHitObject } from '../calculateShoot'
import { encodeAttrsArray, encodeCharacterTypes } from '../encodeFuncs'
import { CharType, CharacterAttrs, CharacterControl, ShootingGameState, defaultCharacterControl } from '../types'
import { GAME_LOOP_TIME, SHOOTER_SPEED } from './constants'
import { proceedMoveTarget } from './proceedMoveTarget'
import { addToPixels, canMove, removeFromPixels, setMove, shooterOnPixels } from './utils'

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

export function cleanupDeadChars(state: ShootingGameState) {
  const ids = Object.keys(state.characterAttrsMap)
  for (const idstr of ids) {
    const id = Number(idstr)
    const attrs = state.characterAttrsMap[id]
    if (attrs && attrs.hp <= 0) {
      delete state.characterAttrsMap[id]
      delete state.characterCtrlMap[id]
      removeShooter(attrs, state.positionCharactersMap)
    }
  }
}

export function proceedControls(state: ShootingGameState, ctrls: CharacterControl[], speed?: number, logger?: any): [CharacterControl[], number[]] {
  const idCtrlMap: {[id: number]: CharacterControl} = {}

  const zombieCtrls = generateZombieCtrls(state)
  ctrls = ctrls.concat(zombieCtrls)

  // aggregate ctrls to execute fires, maximum 1 fire per character
  for (const ctrl of ctrls) {
    const id = ctrl.id

    if (idCtrlMap[id]) {
      ctrl.fire = idCtrlMap[id].fire || ctrl.fire
    }
    idCtrlMap[id] = ctrl
  }

  const idSet = new Set<number>()

  // execute fires
  const updatedCtrls = Object.values(idCtrlMap)
  // const charObjs: [number, number, number, number, number][] = Object.values(state.characterAttrsMap).map(attrs => [attrs.id, attrs.x - 50, attrs.y - 50, 100, 100])
  for (const ctrl of updatedCtrls) if (ctrl.fire) {
    if (ctrl.weapon === 2 || ctrl.weapon === 3) {
      const attrs = state.characterAttrsMap[ctrl.id]
      const angle = ctrl.angle / 100 - 1.5 * Math.PI
      const hitP = attrs ? shootFirstHitObject(state, attrs.id, angle) : null
      if (hitP) {
        if (logger) {
          logger.info("Hit %v", hitP)
        }
        const targetAttrs = state.characterAttrsMap[hitP[0]]
        if (targetAttrs) {
          targetAttrs.hp -= 5
          idSet.add(targetAttrs.id)
          if (targetAttrs.hp <= 0) {
            // character die
            // delete state.characterAttrsMap[targetAttrs.id]
          }
        }
      }
    }
  }

  // execute move
  
  for (const ctrl of ctrls) {
    const id = ctrl.id
    const moved = proceedMoveByCtrl(state, id, ctrl)
    if (moved) {
      idSet.add(id)
      // remember latest control
      state.characterCtrlMap[id] = ctrl
      // delete from target move
      delete state.characterTarget[id]
    }
  }

  // execute target move
  const movedIds = proceedMoveTarget(state)
  for (const movedId of movedIds) idSet.add(movedId)

  return [updatedCtrls, Array.from(idSet)]
}

export function removeShooter(attrs: CharacterAttrs, positionCharactersMap: {[id: number]: number[]}) {
  const pixels = shooterOnPixels(attrs)
  // remove from pixels
  removeFromPixels(positionCharactersMap, attrs.id, pixels)
}

/**
 * This function is used by server for all shooters move
 * For client, only for being controlled shooter
 * 
 * @param attrs 
 * @param ctrl 
 * @param positionCharactersMap 
 * @param buildingBlocks 
 * @param speed 
 * @returns 
 */
export function proceedMoveByCtrl(
  state: ShootingGameState,
  id: number,
  // attrs: CharacterAttrs,
  ctrl: CharacterControl,
  // positionCharactersMap: {[id: number]: number[]},
  // buildingBlocks: {[id: number]: boolean},
  // speed = characterSpeed
): boolean {
  const attrs = state.characterAttrsMap[id]
  if (!attrs) return false

  // cleanup ctrl
  if (ctrl.left && ctrl.right) {
    ctrl.left = ctrl.right = false
  }
  if (ctrl.up && ctrl.down) {
    ctrl.up = ctrl.down = false
  }
  // adjust speed if go diagonally
  const goDiagonal = (ctrl.left && (ctrl.up || ctrl.down)) || (ctrl.right && (ctrl.up || ctrl.down))
  
  // calculate speed
  let speed = SHOOTER_SPEED * GAME_LOOP_TIME * 100 / (goDiagonal ? Math.sqrt(2) : 1)
  
  let isMove = false
  let [x, y] = [attrs.x, attrs.y]
  // move
  if (ctrl.left) {
    if (proceedMove(state, attrs, x - speed, y)) {
      x -= speed
      isMove = true
    }
  }
  if (ctrl.up) {
    if (proceedMove(state, attrs, x, y - speed)) {
      y -= speed
      isMove = true
    }
  }
  if (ctrl.down) {
    if (proceedMove(state, attrs, x, y + speed)) {
      y += speed
      isMove = true
    }
  }
  if (ctrl.right) {
    if (proceedMove(state, attrs, x + speed, y)) {
      x += speed
      isMove = true
    }
  }

  return isMove
}

/**
 * Check and execute move if ok
 * 
 * @param attrs 
 * @param x 
 * @param y 
 * @param positionCharactersMap 
 * @param buildingBlocks 
 * @returns 
 */
function proceedMove(
  state: ShootingGameState,
  attrs: CharacterAttrs,
  x: number,
  y: number,
): boolean {
  // check if collide with building or other shooters
  if (!canMove(state, attrs.id, x, y)) {
    return false
  }

  // execute move
  setMove(attrs, x, y, state.positionCharactersMap)

  return true
}

export function addShooter(state: ShootingGameState, x: number, y: number, type = CharType.man): CharacterAttrs {
  let id = 1
  while (state.characterAttrsMap[id]) id++

  const attrs: CharacterAttrs = { id, hp: 100, x, y }
  state.characterAttrsMap[id] = attrs
  state.characterCtrlMap[id] = Object.assign({}, defaultCharacterControl, { id })
  state.characterTypes[id] = type

  // add to new pixels
  const newPixels = shooterOnPixels(attrs)
  addToPixels(state.positionCharactersMap, attrs.id, newPixels)

  return attrs
}

export function encodeAllShooters(state: ShootingGameState, ids?: number[]): ArrayBuffer {
  const attrsArr = ids ? getAttrsArr(state, ids) : Object.values(state.characterAttrsMap)
  const data = encodeAttrsArray(attrsArr)

  return data
}

function getAttrsArr(state: ShootingGameState, ids: number[]): CharacterAttrs[] {
  const attrsArr = ids.map(id => state.characterAttrsMap[id]).filter(attrs => attrs)

  return attrsArr
}

export function encodeShooterTypes(state: ShootingGameState, ids?: number[]): ArrayBuffer {
  ids = ids || Object.keys(state.characterAttrsMap).map(i => Number(i))
  const types: [number, CharType][] = ids.map(id => [id, state.characterTypes[id] as CharType])

  const data = encodeCharacterTypes(types)

  return data
}

export function generateZombieCtrls(state: ShootingGameState): CharacterControl[] {
  const ctrls: CharacterControl[] = []
  const ids = Object.keys(state.characterAttrsMap).map(i => Number(i))
  for (const id of ids) if (state.characterTypes[id] > 1) {
    const ctrl = Object.assign({}, defaultCharacterControl)
    ctrl.id = id
    const act = Math.floor(Math.random() * 20)
    switch (act) {
      case 0:
        ctrl.up = true
        ctrl.angle = Math.PI * 100
        break
      case 1:
        ctrl.down = true
        ctrl.angle = 0
        break
      case 2:
        ctrl.left = true
        ctrl.angle = Math.PI * 50
        break
      case 3:
        ctrl.right = true
        ctrl.angle = Math.PI * 150
        break
      case 4:
        ctrl.fire = true
        ctrl.angle = state.characterCtrlMap[id].angle
        break
      default:
        Object.assign(ctrl, state.characterCtrlMap[id])
        ctrl.fire = false
        break
    }

    ctrls.push(ctrl)
  }

  return ctrls
}