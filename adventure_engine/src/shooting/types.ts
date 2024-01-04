export interface CharacterAttrs {
  id: number // 1 byte
  hp: number // 1 byte
  // angle: number
  // weapon: number
  x: number // 2 bytes
  y: number // 2 bytes
}

export const defaultCharacterAttrs: CharacterAttrs = {
  id: 0,
  hp: 100,
  // angle: 0,
  // weapon: 1,
  x: 5000,
  y: 5000
}

export interface CharacterControl {
  up: boolean  // up 1bit
  down: boolean  // down 1bit
  left: boolean  // left 1bit
  right: boolean  // right 1bit
  fire: boolean  // fire 1bit
  weapon: number // weapon 3bit
  angle: number // angle 10bit (radian 0 -> 2PI)
  id: number  // 6bit
}

export const defaultCharacterControl: CharacterControl = {
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false,
  weapon: 1,
  angle: 0,
  id: 0
}

export interface ShootingGameState {
  characterAttrsMap: {[id: number]: CharacterAttrs}
  characterCtrlMap: {[id: number]: CharacterControl}
}

export interface ShootingGameStateUpdates {
  updateIds: number[]
  updates: CharacterAttrs[]
  fireIds: number[]
  deadIds: number[]
}
