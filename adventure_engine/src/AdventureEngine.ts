import { ActionInfo, AdventureState, AdventureUpdate, BeastAttrs, WeaponAttrs } from './types'
import { getPixelIndexesFromArea, getPixelXYFromIndex } from './utils'

export class AdventureEngine {
  // // beast_id => attributes
  // beastAttrsMap = new Map<number, BeastAttrs>()
  // // beast_id => pixel map
  // beastPixelMap = new Map<number, number>()
  // // pixel => beast_id map
  // pixelBeastMap = new Map<number, number>()
  // // beasts alive on map
  // beastOnMap: number[]

  // // weapon id => attributes
  // weaponAttrsMap = new Map<number, WeaponAttrs>()

  // // pixel => array of (item, quantity)
  // pixelItemsMap = new Map<number, [number, number][]>()

  // // pixel => vehicle
  // pixelVehicleMap = new Map<number, number>()

  // // beast_id => array of equipped weapons (weapon id, quantity)
  // beastEquipmentsMap = new Map<number, [number, number][]>()

  static initState(): AdventureState {
    // TODO load weapons data on-chain
    // this.weaponAttrsMap.set(1, { damage: 1, damageArea: {x: -1, y: -1, w: 3, h: 3} })
    const state: AdventureState = {
      // beast_id => attributes
      beastAttrsMap: {},
      // beast_id => pixel map
      beastPixelMap: {},
      // pixel => beast_id map
      pixelBeastMap: {},
      // beasts alive on map
      beastOnMap: [],

      // weapon id => attributes
      weaponAttrsMap: {},

      // pixel => array of (item, quantity)
      pixelItemMap: {},

      // pixel => vehicle
      pixelWeaponsMap: {},

      // beast_id => array of equipped weapons (weapon id, quantity)
      beastEquipWeaponsMap: {},

      beastEquipItemMap: {}
    }

    state.weaponAttrsMap[1] = { damage: 1, damageArea: {x: -1, y: -1, w: 3, h: 3} }

    return state
  }

  static getAllBeastPositions(state: AdventureState): ActionInfo[] {
    const positions: ActionInfo[] = Object.keys(state.beastPixelMap).map(id => Number(id)).map(id => ({beastId: id, pixel: state.beastPixelMap[id]}))
    // const positions: ActionInfo[] = Array.from(state.beastPixelMap.entries()).map(entry => ({beastId: entry[0], pixel: entry[1]}))

    return positions
  }

  static getAllBeastProps(state: AdventureState): [number[], number[], number[]] {
    // beast ids
    const beastIds = Object.keys(state.beastAttrsMap).map(id => Number(id))
    // hps
    const hps = beastIds.map(id => state.beastAttrsMap[id].health || 3)
    // equipped items
    const items = beastIds.map(id => state.beastEquipItemMap[id] || 0)

    return [beastIds, hps, items]
  }

  static getAllPixelItems(state: AdventureState): [number[], number[]] {
    // pixel which has item on it
    const pixels = Object.keys(state.pixelItemMap).map(id => Number(id))
    // item on pixel
    const items = pixels.map(pixel => state.pixelItemMap[pixel] || 0)

    return [pixels, items]
  }

  static onboardBeast(state: AdventureState, beastId: number, pixel: number, weapons: [number, number][], attrs?: BeastAttrs) {
    // TODO load beast location, equipments, attributes on-chain
    AdventureEngine.executeMove(state, {beastId, pixel})
    state.beastEquipWeaponsMap[beastId] = weapons
    state.beastAttrsMap[beastId] = attrs || { health: 3, moveRange: 4, shootRange: 4 }
  }

  static dropItemOnMap(state: AdventureState, itemId: number, pixel: number): boolean {
    // check if current item on pixel
    const currentItem = state.pixelItemMap[pixel]
    if (currentItem >= 0) {
      return false
    }

    state.pixelItemMap[pixel] = itemId

    return true
  }

  static proceedActions(state: AdventureState, moves: ActionInfo[], shoots: ActionInfo[]): AdventureUpdate {
    const updates: AdventureUpdate = {
      moves: [],
      shoots: [],
      changedBeasts: [],
      changedBeastHps: [],
      changedBeastEquips: [],
      changedPixels: [],
      changedPixelItems: [],
    }

    for (let move of moves) {
      const { beastId, pixel } = move
      const attr = state.beastAttrsMap[beastId]

      // check if beastId is alive
      const curpos = state.beastPixelMap[beastId]
      if (curpos >= 0) {

        // TODO check move is valid (in range)
        
        // check move target is empty
        if (state.pixelBeastMap[pixel] === undefined) {
          AdventureEngine.executeMove(state, move)
          updates.moves.push(move)
        }
      }
    }

    // beasts that have updates (get damage or equips item)
    const changedBeastSet = new Set<number>()

    for (let shoot of shoots) {
      const { beastId, pixel } = shoot
      // check if beastId is alive
      const curpos = state.beastPixelMap[beastId]
      if (curpos >= 0) {
        // TODO check shoot range
        AdventureEngine.executeShoot(state, shoot, changedBeastSet)
        updates.shoots.push(shoot)
      }
    }

    const changedPixels: number[] = []

    // check if moved beasts equip item
    for (const move of updates.moves) {
      const beastId = AdventureEngine.tryEquips(state, move.pixel)
      if (beastId >= 0) {
        changedBeastSet.add(beastId)
        changedPixels.push(move.pixel)
      }
    }

    updates.changedBeasts = Array.from(changedBeastSet)
    updates.changedBeastHps = updates.changedBeasts.map(beastId => state.beastAttrsMap[beastId].health)
    updates.changedBeastEquips = updates.changedBeasts.map(beastId => state.beastEquipItemMap[beastId] || 0)

    updates.changedPixels = changedPixels
    updates.changedPixelItems = changedPixels.map(pixel => state.pixelItemMap[pixel] || 0)

    return updates
  }

  /**
   * 
   * @param state 
   * @param pixel 
   * @returns beastId if equips success
   */
  static tryEquips(state: AdventureState, pixel: number): number {
    const beastId = state.pixelBeastMap[pixel]
    if (beastId === undefined) { return -1 }

    const item = state.pixelItemMap[pixel]
    if (item === undefined) { return -1 }

    // check if beast already equip
    const equippedItem = state.beastEquipItemMap[beastId]
    if (equippedItem >= 0) { return -1 }

    // beast equips item
    delete state.pixelItemMap[pixel]
    state.beastEquipItemMap[beastId] = item

    // TODO try equips weapons on the pixel

    return beastId
  }

  // private checkBeastAlive(beastId: number, updateAttrs: Map<number, BeastAttrs>): boolean {
  //   const attrs = updateAttrs.get(beastId)
  // }

  static executeMove(state: AdventureState, move: ActionInfo) {
    const { beastId, pixel } = move
    const from = state.beastPixelMap[beastId]
  
    state.beastPixelMap[beastId] = pixel
    state.pixelBeastMap[pixel] = beastId
  
    delete state.pixelBeastMap[from]
  }

  static executeShoot(state: AdventureState, shoot: ActionInfo, changedBeasts: Set<number>) {
    const { beastId, pixel, type } = shoot

    // TODO check if beast equips this weapon

    // get the weapon attributes or default
    const { damage, damageArea } = state.weaponAttrsMap[type] || { damage: 1, damageArea: {x: 0, y: 0, w: 1, h: 1} }
    const [tarx, tary] = getPixelXYFromIndex(pixel, 100)
    const [x, y, w, h] = [tarx + damageArea.x, tary + damageArea.y, damageArea.w, damageArea.h]

    const damagedPixels = getPixelIndexesFromArea({x, y, w, h}, 100)

    for (let target of damagedPixels) {
      const update = AdventureEngine.receiveDamage(state, target, damage)
      if (update) {
        const [beastId, attrs] = update
        state.beastAttrsMap[beastId] = attrs
        changedBeasts.add(beastId)
      }
    }
  }

  static receiveDamage(state: AdventureState, pixel: number, damage: number): [number, BeastAttrs] | undefined {
    const beastId = state.pixelBeastMap[pixel]
    if (beastId === undefined) {
      // no beast on the target pixel
      return undefined
    }

    const attrs = state.beastAttrsMap[beastId]
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
      AdventureEngine.beastDie(state, beastId)
    }

    return [beastId, { health }]
  }

  static beastDie(state: AdventureState, beastId: number) {
    const pos = state.beastPixelMap[beastId]
    delete state.pixelBeastMap[pos]
    delete state.beastPixelMap[beastId]
    delete state.beastAttrsMap[beastId]
    // delete state.positionBeast[target]
    // delete state.beastPosition[die]
  }
}