export enum BeastActionType {
  move,
  shoot
}

// info about an action, for both move and shoot
export interface ActionInfo {
  // beast id
  beastId: number
  // target position
  pixel: number
  // weapon_id - only for shoot action
  type?: number
}

export interface WeaponAttrs {
  // damage area, default {x: 0, y: 0, w: 1, h: 1}
  damageArea?: {x: number, y: number, w: number, h: number}
  // damage, default 1
  damage?: number
  // + shoot range, default 0
  incrRange?: number
}

export interface VehicleAttrs {
  // + move range, default 0
  incrRange?: number
  // - damage receive, default 0
  decrDamage?: number
}

export interface BeastAttrs {
  hp?: number
  maxHp?: number
  moveRange?: number
  shootRange?: number
  w?: number
  h?: number
}

export const defaultBeastAttrs: BeastAttrs = {
  hp: 3,
  maxHp: 3,
  moveRange: 4,
  shootRange: 4,
  w: 1,
  h: 1,
}

export interface AdventureUpdate {
  moves: ActionInfo[]
  shoots: ActionInfo[]

  changedBeasts: number[]
  changedBeastHps: number[]
  changedBeastEquips: number[]

  changedPixels: number[]
  changedPixelItems: number[]
}

export interface AdventureState {
  // beast_id => attributes
  beastAttrsMap: { [id: number]: BeastAttrs } // number, BeastAttrs>
  // beast type_id => attributes
  beastTypeAttrsMap: { [id: number]: BeastAttrs }
  // beast_id => pixel map
  beastPixelMap: { [id: number]: number } // Map<number, number>
  // pixel => beast_id map
  pixelBeastMap: { [id: number]: number } // Map<number, number>
  // beasts alive on map
  beastOnMap: number[]

  // weapon id => attributes
  weaponAttrsMap: { [id: number]: WeaponAttrs } // Map<number, WeaponAttrs>

  // pixel => array of (item, quantity)
  pixelWeaponsMap: { [pixel: number]: [number, number][] }// Map<number, [number, number][]>

  // pixel => vehicle
  pixelItemMap: { [pixel: number]: number } // Map<number, number>

  // beast_id => array of equipped weapons (weapon id, quantity)
  beastEquipWeaponsMap: { [id: number]: [number, number][] } // Map<number, [number, number][]>

  beastEquipItemMap: { [id: number]: number }
}
