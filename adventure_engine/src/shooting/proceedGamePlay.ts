import { WORLD_HEIGHT, WORLD_WIDTH } from '../utils'
import { shootFirstHitObject } from './calculateShoot'
import { encodeAttrsArray, encodeCharacterTypes } from './encodeFuncs'
import { CharType, CharacterAttrs, CharacterControl, ShootingGameState, defaultCharacterAttrs, defaultCharacterControl } from './types'
import { findUniqueElements, shooterOnPixels } from './utils'

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
      const hitP = attrs ? shootFirstHitObject(attrs.id, angle, state.positionCharactersMap, state.characterAttrsMap, state.buildingBlocks) : null
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
    const attrs = state.characterAttrsMap[id]
    if (attrs) {
      const moved = proceedMoveByCtrl(attrs, ctrl, state.positionCharactersMap, state.buildingBlocks, speed)
      if (moved) {
        idSet.add(id)
        // remember latest control
        state.characterCtrlMap[id] = ctrl
      }
    }
  }

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
  attrs: CharacterAttrs,
  ctrl: CharacterControl,
  positionCharactersMap: {[id: number]: number[]},
  buildingBlocks: {[id: number]: boolean},
  speed = characterSpeed
): boolean {
  let isMove = false
  let [x, y] = [attrs.x, attrs.y]
  // move
  if (ctrl.left) {
    if (proceedMove(attrs, x - speed, y, positionCharactersMap, buildingBlocks)) {
      x -= speed
      isMove = true
    }
  }
  if (ctrl.up) {
    if (proceedMove(attrs, x, y - speed, positionCharactersMap, buildingBlocks)) {
      y -= speed
      isMove = true
    }
  }
  if (ctrl.down) {
    if (proceedMove(attrs, x, y + speed, positionCharactersMap, buildingBlocks)) {
      y += speed
      isMove = true
    }
  }
  if (ctrl.right) {
    if (proceedMove(attrs, x + speed, y, positionCharactersMap, buildingBlocks)) {
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
  attrs: CharacterAttrs,
  x: number,
  y: number,
  positionCharactersMap: {[id: number]: number[]},
  buildingBlocks: {[id: number]: boolean},
): boolean {
  // check out of the map
  if (x < 0 || x > WORLD_WIDTH * 100 || y < 0 || y > WORLD_HEIGHT * 100) return false

  const newPixels = shooterOnPixels({x, y, hp: 0, id: 0})

  // check if newPixels are not building block
  for (const pixel of newPixels) {
    if (buildingBlocks[pixel]) return false
  }

  // TODO check if collide with other shooters

  // execute move
  setMove(attrs, x, y, positionCharactersMap)

  return true
}

/**
 * This function is also used by client, to update all shooter's position from server
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