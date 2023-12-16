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
      pixelItemsMap: {},

      // pixel => vehicle
      pixelVehicleMap: {},

      // beast_id => array of equipped weapons (weapon id, quantity)
      beastEquipmentsMap: {}
    }

    state.weaponAttrsMap[1] = { damage: 1, damageArea: {x: -1, y: -1, w: 3, h: 3} }

    return state
  }

  static getAllBeastPositions(state: AdventureState): ActionInfo[] {
    const positions: ActionInfo[] = Object.keys(state.beastPixelMap).map(id => Number(id)).map(id => ({beastId: id, pixel: state.beastPixelMap[id]}))
    // const positions: ActionInfo[] = Array.from(state.beastPixelMap.entries()).map(entry => ({beastId: entry[0], pixel: entry[1]}))

    return positions
  }

  static onboardBeast(state: AdventureState, beastId: number, pixel: number, equipments: [number, number][], attrs?: BeastAttrs) {
    // TODO load beast location, equipments, attributes on-chain
    AdventureEngine.executeMove(state, {beastId, pixel})
    state.beastEquipmentsMap[beastId] = equipments
    state.beastAttrsMap[beastId] = attrs
  }

  static proceedActions(state: AdventureState, moves: ActionInfo[], shoots: ActionInfo[]): AdventureUpdate {
    const updates: AdventureUpdate = {
      moves: [],
      shoots: [],
      changedBeasts: [],
      changedBeastAttrs: []
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

    // beasts that getting damages
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

    updates.changedBeasts = Array.from(changedBeastSet)
    updates.changedBeastAttrs = updates.changedBeasts.map(beastId => state.beastAttrsMap[beastId])

    return updates
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