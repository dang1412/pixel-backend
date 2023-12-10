enum BeastAction {
  move,
  shoot
}

// info about an action, for both move and shoot
interface ActionInfo {
  // beast id
  beastId: number
  // target position
  pixel: number
  // weapon_id - only for shoot action
  weaponId?: number
}

interface WeapenAttrs {
  damageRange?: {x: number, y: number, w: number, h: number}
  damage?: number
  incrRange?: number
}

interface BeastAttrs {
  health: number
  moveRange: number
  shootRange: number
}

interface AdventureUpdate {
  moves: ActionInfo[]
  shoots: ActionInfo[]
  deads: number[]
}

export class AdventureEngine {
  // beast_id => pixel map
  beastPixelMap = new Map<number, number>()
  // pixel => beast_id map
  pixelBeastMap = new Map<number, number>()
  // beasts alive on map
  beastOnMap: number[]

  // weapon type => attributes
  weaponTypeAttrsMap = new Map<number, WeapenAttrs>()
}