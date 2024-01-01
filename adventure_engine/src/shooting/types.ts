export interface CharacterAttrs {
  hp: number
  angle: number
  weapon: number
  x: number
  y: number
}

export const defaultCharacterAttrs: CharacterAttrs = {
  hp: 100,
  angle: -90,
  weapon: 1,
  x: 50,
  y: 50
}

export interface CharacterControl {
  u: boolean  // up 1bit
  d: boolean  // down 1bit
  l: boolean  // left 1bit
  r: boolean  // right 1bit
  f: boolean  // fire 1bit
  w: number // weapon 3bit
  id: number  // 15bit
  a: number // angle 9bit
}

export interface ShootingGameState {
  characterAttrsMap: {[id: number]: CharacterAttrs}
}

export interface ShootingGameStateUpdates {
  updateIds: number[]
  updates: CharacterAttrs[]
  fireIds: number[]
  deadIds: number[]
}
