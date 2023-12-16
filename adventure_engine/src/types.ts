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
  health?: number
  moveRange?: number
  shootRange?: number
}

export interface AdventureUpdate {
  moves: ActionInfo[]
  shoots: ActionInfo[]
  changedBeasts: number[]
  changedBeastAttrs: BeastAttrs[]
}