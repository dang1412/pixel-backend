import { ActionInfo, AdventureUpdate, BeastAttrs, WeaponAttrs } from './types'
import { getPixelIndexesFromArea, getPixelXYFromIndex } from './utils'

export class AdventureEngine {
  // beast_id => attributes
  beastAttrsMap = new Map<number, BeastAttrs>()
  // beast_id => pixel map
  beastPixelMap = new Map<number, number>()
  // pixel => beast_id map
  pixelBeastMap = new Map<number, number>()
  // beasts alive on map
  beastOnMap: number[]

  // weapon id => attributes
  weaponAttrsMap = new Map<number, WeaponAttrs>()

  // pixel => array of (item, quantity)
  pixelItemsMap = new Map<number, [number, number][]>()

  // pixel => vehicle
  pixelVehicleMap = new Map<number, number>()

  // beast_id => array of equipped weapons (weapon id, quantity)
  beastEquipmentsMap = new Map<number, [number, number][]>()

  constructor() {
    // TODO load weapons data on-chain
    this.weaponAttrsMap.set(1, { damage: 1, damageArea: {x: -1, y: -1, w: 3, h: 3} })
  }

  getAllBeastPositions(): ActionInfo[] {
    // const positions: ActionInfo[] = Object.keys(this.beastPixelMap).map(id => Number(id)).map(id => ({beastId: id, pixel: this.beastPixelMap.get(id)}))
    const positions: ActionInfo[] = Array.from(this.beastPixelMap.entries()).map(entry => ({beastId: entry[0], pixel: entry[1]}))

    return positions
  }

  onboardBeast(beastId: number, pixel: number, equipments: [number, number][], attrs?: BeastAttrs) {
    // TODO load beast location, equipments, attributes on-chain
    this.executeMove({beastId, pixel})
    this.beastEquipmentsMap.set(beastId, equipments)
    this.beastAttrsMap.set(beastId, attrs)
  }

  proceedActions(moves: ActionInfo[], shoots: ActionInfo[]): AdventureUpdate {
    const updates: AdventureUpdate = {
      moves: [],
      shoots: [],
      changedBeasts: [],
      changedBeastAttrs: []
    }

    for (let move of moves) {
      const { beastId, pixel } = move
      const attr = this.beastAttrsMap.get(beastId)

      // check if beastId is alive
      const curpos = this.beastPixelMap.get(beastId)
      if (curpos >= 0) {

        // TODO check move is valid (in range)
        
        // check move target is empty
        if (this.pixelBeastMap.get(pixel) === undefined) {
          this.executeMove(move)
          updates.moves.push(move)
        }
      }
    }

    // beasts that getting damages
    const changedBeastSet = new Set<number>()

    for (let shoot of shoots) {
      const { beastId, pixel } = shoot
      // check if beastId is alive
      const curpos = this.beastPixelMap.get(beastId)
      if (curpos >= 0) {
        // TODO check shoot range
        this.executeShoot(shoot, changedBeastSet)
        updates.shoots.push(shoot)
      }
    }

    updates.changedBeasts = Array.from(changedBeastSet)
    updates.changedBeastAttrs = updates.changedBeasts.map(beastId => this.beastAttrsMap.get(beastId))

    return updates
  }

  // private checkBeastAlive(beastId: number, updateAttrs: Map<number, BeastAttrs>): boolean {
  //   const attrs = updateAttrs.get(beastId)
  // }

  private executeMove(move: ActionInfo) {
    const { beastId, pixel } = move
    const from = this.beastPixelMap.get(beastId)
  
    this.beastPixelMap.set(beastId, pixel)
    this.pixelBeastMap.set(pixel, beastId)
  
    this.pixelBeastMap.delete(from)
  }

  private executeShoot(shoot: ActionInfo, changedBeasts: Set<number>) {
    const { beastId, pixel, type } = shoot

    // TODO check if beast equips this weapon

    // get the weapon attributes or default
    const { damage, damageArea } = this.weaponAttrsMap.get(type) || { damage: 1, damageArea: {x: 0, y: 0, w: 1, h: 1} }
    const [tarx, tary] = getPixelXYFromIndex(pixel, 100)
    const [x, y, w, h] = [tarx + damageArea.x, tary + damageArea.y, damageArea.w, damageArea.h]

    const damagedPixels = getPixelIndexesFromArea({x, y, w, h}, 100)

    for (let target of damagedPixels) {
      const update = this.receiveDamage(target, damage)
      if (update) {
        const [beastId, attrs] = update
        this.beastAttrsMap.set(beastId, attrs)
        changedBeasts.add(beastId)
      }
    }
  }

  private receiveDamage(pixel: number, damage: number): [number, BeastAttrs] | undefined {
    const beastId = this.pixelBeastMap.get(pixel)
    if (beastId === undefined) {
      // no beast on the target pixel
      return undefined
    }

    const attrs = this.beastAttrsMap.get(beastId)
    if (attrs === undefined) {
      // no beast attrs
      return undefined
    }

    if (attrs.health === 0) {
      // already dead
      return undefined
    }

    // receive damage, only update health for now
    const health = Math.max(attrs.health - damage, 0)

    if (health === 0) {
      this.beastDie(beastId)
    }

    return [beastId, { health }]
  }

  private beastDie(beastId: number) {
    const pos = this.beastPixelMap.get(beastId)
    this.pixelBeastMap.delete(pos)
    this.beastPixelMap.delete(beastId)
    this.beastAttrsMap.delete(beastId)
    // delete state.positionBeast[target]
    // delete state.beastPosition[die]
  }
}