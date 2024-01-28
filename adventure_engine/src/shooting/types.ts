export interface CharacterAttrs {
  id: number // 1 byte
  hp: number // 1 byte
  x: number // 2 bytes
  y: number // 2 bytes
}

export const defaultCharacterAttrs: CharacterAttrs = {
  id: 0,
  hp: 100,
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

export enum CharType {
  man = 0,
  woman = 1,
  zombie1 = 2,
  zombie2 = 3,
  zombie3 = 4,
  zombie4 = 5,
}

export interface ShootingGameState {
  characterAttrsMap: {[id: number]: CharacterAttrs}
  characterCtrlMap: {[id: number]: CharacterControl}
  characterTypes: {[id: number]: CharType}
  characterTarget: {[id: number]: [number, number]}

  // 1 pixel can hold more than 1 shooter
  positionCharactersMap: {[id: number]: number[]}
  // buildings
  buildingBlocks: {[id: number]: boolean}
}

export interface ShootingGameStateUpdates {
  updateIds: number[]
  updates: CharacterAttrs[]
  fireIds: number[]
  deadIds: number[]
}
