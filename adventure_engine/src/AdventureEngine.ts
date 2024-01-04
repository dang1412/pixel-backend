import { ActionInfo, AdventureState, AdventureUpdate, BeastAttrs, WeaponAttrs, defaultBeastAttrs } from './types'
import { getPixelsFromArea, getPixelXYFromIndex, WORLD_WIDTH } from './utils'

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
      // beast type_id => attributes
      beastTypeAttrsMap: {},
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

    state.weaponAttrsMap[1] = { damage: 1, damageArea: {x: -1, y: 0, w: 3, h: 3} }
    state.weaponAttrsMap[2] = { damage: 1, damageArea: {x: -1, y: -1, w: 3, h: 3} }

    state.beastTypeAttrsMap = {
      // Saitama
      7: { maxHp: 10 },
      // Venom
      8: { w: 3, h: 3, maxHp: 10 }
    }

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
    const hps = beastIds.map(id => state.beastAttrsMap[id].hp || 3)
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

  static onboardBeast(state: AdventureState, beastId: number, pixel: number, weapons: [number, number][], attrs?: BeastAttrs): boolean {
    const type = Math.floor(beastId / 1000000)
    // const beastAttrs = {...defaultBeastAttrs, ...state.beastTypeAttrsMap[type] || {}, ...attrs || {}}
    const beastAttrs = Object.assign({}, defaultBeastAttrs, state.beastTypeAttrsMap[type] || {}, attrs || {})
    state.beastAttrsMap[beastId] = beastAttrs

    // const [x, y] = getPixelXYFromIndex(pixel, WORLD_WIDTH)
    // const pixels = getPixelsFromArea({x, y, w: beastAttrs.w, h: beastAttrs.h}, WORLD_WIDTH)

    // check if space empty
    // for (const p of pixels) if (state.pixelBeastMap[p] && state.pixelBeastMap[p] !== beastId) {
    //   // not empty
    //   return false
    // }

    // TODO load beast location, equipments, attributes on-chain
    const moved = AdventureEngine.executeMove(state, { beastId, pixel })
    if (moved) state.beastEquipWeaponsMap[beastId] = weapons

    return moved
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

  static proceedDropItem(state: AdventureState, dropItems: ActionInfo[], updates: AdventureUpdate) {
    for (const action of dropItems) {
      const { beastId: itemId, pixel } = action
      const isDropped = AdventureEngine.dropItemOnMap(state, itemId, pixel)
      if (isDropped) {
        updates.changedPixels.push(pixel)
        updates.changedPixelItems.push(itemId)
      }
    }
  }

  static proceedActions(state: AdventureState, moves: ActionInfo[], shoots: ActionInfo[], dropEquipBeasts: number[]): AdventureUpdate {
    const updates: AdventureUpdate = {
      moves: [],
      shoots: [],
      changedBeasts: [],
      changedBeastHps: [],
      changedBeastEquips: [],
      changedPixels: [],
      changedPixelItems: [],
    }

    // beasts that have updates (get damage or equips item)
    const changedBeastSet = new Set<number>()

    const changedPixelSet = new Set<number>()

    // proceed beast drop item
    for (const beastId of dropEquipBeasts) {
      // get item
      const item = state.beastEquipItemMap[beastId]
      if (!item) continue // no equipping

      // get position
      const pixel = state.beastPixelMap[beastId]
      if (pixel === undefined) continue // beast dead

      const isDropped = AdventureEngine.dropItemOnMap(state, item, pixel)
      if (isDropped) {
        // unequip beast
        delete state.beastEquipItemMap[beastId]
        // add beast to change list
        changedBeastSet.add(beastId)
        // add pixel to change list
        changedPixelSet.add(pixel)
      }
    }

    for (let move of moves) {
      const { beastId, pixel } = move
      // const attr = state.beastAttrsMap[beastId]
      

      // check if beastId is alive
      const curpos = state.beastPixelMap[beastId]
      if (curpos >= 0) {

        // TODO check move is valid (in range)

        // check move target is empty
        const moved = AdventureEngine.executeMove(state, move)
        if (moved) updates.moves.push(move)
      }
    }

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

    // check if moved beasts equip item
    for (const move of updates.moves) {
      const beastId = AdventureEngine.tryEquips(state, move.pixel)
      if (beastId >= 0) {
        changedBeastSet.add(beastId)
        changedPixelSet.add(move.pixel)
      }
    }

    updates.changedBeasts = Array.from(changedBeastSet)
    updates.changedBeastHps = updates.changedBeasts.map(beastId => state.beastAttrsMap[beastId].hp)
    updates.changedBeastEquips = updates.changedBeasts.map(beastId => state.beastEquipItemMap[beastId] || 0)

    updates.changedPixels = Array.from(changedPixelSet)
    updates.changedPixelItems = updates.changedPixels.map(pixel => state.pixelItemMap[pixel] || 0)

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

  static executeMove(state: AdventureState, { beastId, pixel }: ActionInfo): boolean {
    const attr = state.beastAttrsMap[beastId]
    const [x, y] = getPixelXYFromIndex(pixel, WORLD_WIDTH)
    const pixels = getPixelsFromArea({x, y, w: attr.w, h: attr.h}, WORLD_WIDTH)
    // check if target pixels are empty
    for (const p of pixels) if (state.pixelBeastMap[p] && state.pixelBeastMap[p] !== beastId) {
      return false
    }

    // clear from pixels
    const from = state.beastPixelMap[beastId]
    if (from >= 0) {
      const [fx, fy] = getPixelXYFromIndex(from, WORLD_WIDTH)
      const fromPixels = getPixelsFromArea({ x: fx, y: fy, w: attr.w, h: attr.h }, WORLD_WIDTH)
      for (const fp of fromPixels) delete state.pixelBeastMap[fp]
    }
  
    // new location
    state.beastPixelMap[beastId] = pixels[0]
    for (const p of pixels) state.pixelBeastMap[p] = beastId

    return true
  }

  static executeShoot(state: AdventureState, shoot: ActionInfo, changedBeasts: Set<number>) {
    const { beastId, pixel, type } = shoot

    // TODO check if beast equips this weapon

    // get the weapon attributes or default
    const { damage, damageArea } = state.weaponAttrsMap[type] || { damage: 1, damageArea: {x: 0, y: 0, w: 1, h: 1} }
    const [tarx, tary] = getPixelXYFromIndex(pixel, WORLD_WIDTH)
    const [x, y, w, h] = [tarx + damageArea.x, tary + damageArea.y, damageArea.w, damageArea.h]

    const damagedPixels = getPixelsFromArea({x, y, w, h}, WORLD_WIDTH)

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

    if (attrs.hp === 0) {
      // already dead
      return undefined
    }

    // receive damage, only update hp for now
    const hp = Math.max(attrs.hp - damage, 0)

    if (hp === 0) {
      AdventureEngine.beastDie(state, beastId)
    }

    return [beastId, { hp }]
  }

  static beastDie(state: AdventureState, beastId: number) {
    const attrs = state.beastAttrsMap[beastId]
    const pixel = state.beastPixelMap[beastId]

    const [x, y] = getPixelXYFromIndex(pixel, WORLD_WIDTH)
    const pixels = getPixelsFromArea({x, y, w: attrs.w, h: attrs.h}, WORLD_WIDTH)
    for (const p of pixels) delete state.pixelBeastMap[p]

    delete state.beastPixelMap[beastId]
    delete state.beastAttrsMap[beastId]
  }
}