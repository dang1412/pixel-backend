import { describe, expect, test } from '@jest/globals'
import { AdventureEngine } from './AdventureEngine'
import { decodeMatchUpdate, encodeMatchUpdate } from './flatbuffer/encode'
import { AdventureState, AdventureUpdate, BeastAttrs } from './types'
import { WORLD_WIDTH, getPixelIndex, getPixelsFromArea } from './utils'

describe('AdventureEngine', () => {
  test('initState state', () => {
    const state = AdventureEngine.initState()
    expect(state.weaponAttrsMap[1]).toEqual({ damage: 1, damageArea: {x: -1, y: 0, w: 3, h: 3} })
  })

  test('onboardBeast should work', () => {
    const state = AdventureEngine.initState()

    AdventureEngine.onboardBeast(state, 1, 99, [])
    expect(state.beastPixelMap[1]).toBe(99)
    expect(state.pixelBeastMap[99]).toBe(1)
  })

  test('proceedActions should work', () => {
    const state = AdventureEngine.initState()

    AdventureEngine.onboardBeast(state, 1, 99, [])
    expect(state.beastPixelMap[1]).toBe(99)

    const updates = AdventureEngine.proceedActions(state, [{ beastId: 1, pixel: 100 }], [], [])
    expect(updates.moves).toEqual([{ beastId: 1, pixel: 100 }])
  })

  test('getAllBeastPositions should work', () => {
    const state = AdventureEngine.initState()

    AdventureEngine.onboardBeast(state, 1, 99, [])
    AdventureEngine.onboardBeast(state, 2, 120, [])
    expect(state.beastPixelMap[1]).toBe(99)
    expect(state.pixelBeastMap[99]).toBe(1)

    expect(state.beastPixelMap[2]).toBe(120)
    expect(state.pixelBeastMap[120]).toBe(2)

    const _updates = AdventureEngine.proceedActions(state, [{ beastId: 1, pixel: 100 }], [], [])
    AdventureEngine.onboardBeast(state, 3, 99, [])

    const pos = AdventureEngine.getAllBeastPositions(state)
    expect(pos).toEqual([{ beastId: 1, pixel: 100 }, { beastId: 2, pixel: 120 }, { beastId: 3, pixel: 99 }])
  })

  test('flatbuffer encode/decode should work', () => {
    const updates: AdventureUpdate = {
      moves: [{ beastId: 1, pixel: 100, type: 10 }, { beastId: 2, pixel: 120, type: 100 }],
      shoots: [{ beastId: 5, pixel: 200, type: 1 }],
      changedBeasts: [1],
      changedBeastHps: [2],
      changedBeastEquips: [1],
      changedPixels: [100],
      changedPixelItems: [0]
    }
    const encoded = encodeMatchUpdate(updates)
    const decoded = decodeMatchUpdate(encoded)
    console.log(decoded)
    // sort the moves array by beastId
    decoded.moves.sort((a, b) => a.beastId - b.beastId)
    // compare
    expect(decoded).toEqual(updates)
  })

  test('dropItemOnMap should work', () => {
    const state = AdventureEngine.initState()

    // drop item at pixel 100
    AdventureEngine.dropItemOnMap(state, 1, 100)

    expect(state.pixelItemMap[100]).toBe(1)
  })

  test('getAllPixelItems should work', () => {
    const state = AdventureEngine.initState()

    // drop items on map
    AdventureEngine.dropItemOnMap(state, 1, 100)
    AdventureEngine.dropItemOnMap(state, 5, 200)
    const isDropped = AdventureEngine.dropItemOnMap(state, 6, 200)

    expect(state.pixelItemMap[100]).toBe(1)
    expect(state.pixelItemMap[200]).toBe(5)
    expect(isDropped).toBe(false)

    const [pixels, items] = AdventureEngine.getAllPixelItems(state)

    expect(pixels).toEqual([100, 200])
    expect(items).toEqual([1, 5])
  })

  test('Move and take item on map', () => {
    const state = AdventureEngine.initState()

    // onboard beast 1 at pixel 99
    AdventureEngine.onboardBeast(state, 1, 120, [])
    // beast 2 at pixel 102
    AdventureEngine.onboardBeast(state, 2, 124, [])

    // drop item 1 at pixel 100
    AdventureEngine.dropItemOnMap(state, 1, 122)

    // beast move to pixel 100, to take the item on map
    const updates = AdventureEngine.proceedActions(state, [{beastId: 1, pixel: 122}], [{beastId:2, pixel: 122}], [])
    const expectRs: AdventureUpdate = {
      moves: [{beastId: 1, pixel: 122}],
      shoots: [{beastId:2, pixel: 122}],
      changedBeasts: [1], // beast 1 has updates
      changedBeastHps: [2], // beast 1 HP reduce 1 (3 -> 2)
      changedBeastEquips: [1],  // beast 1 equips item 1
      changedPixels: [122], // pixel 122 has updates
      changedPixelItems: [0]  // item on pixel 122 disapear (taken by beast 1)
    }
    expect(updates).toEqual(expectRs)
  })

  test('onboardBeast bigger than 1x1 should work', () => {
    const state = AdventureEngine.initState()

    expect(onboardBeastXY(state, 1, 20, 30, {})).toBe(true)
    expect(onboardBeastXY(state, 2, 19, 29, {w: 3, h: 3})).toBe(false)
    expect(onboardBeastXY(state, 2, 19, 31, {w: 3, h: 3})).toBe(true)

    // confirm location
    for (const p of getPixelsFromArea({x: 19, y: 31, w: 3, h: 3}, WORLD_WIDTH)) {
      expect(state.pixelBeastMap[p]).toBe(2)
    }
    expect(state.beastPixelMap[2]).toBe(getPixelIndex(19, 31, WORLD_WIDTH))

    // move beast with size 3x3 to (20, 31)
    AdventureEngine.executeMove(state, { beastId: 2, pixel: getPixelIndex(20, 31, WORLD_WIDTH) })

    // confirm new location
    for (const p of getPixelsFromArea({x: 20, y: 31, w: 3, h: 3}, WORLD_WIDTH)) {
      expect(state.pixelBeastMap[p]).toBe(2)
    }
    expect(state.beastPixelMap[2]).toBe(getPixelIndex(20, 31, WORLD_WIDTH))

    // confirm spaces behind
    for (const p of getPixelsFromArea({x: 19, y: 31, w: 1, h: 3}, WORLD_WIDTH)) {
      expect(state.pixelBeastMap[p]).toBe(undefined)
    }
  })
})

function onboardBeastXY(state: AdventureState, beastId: number, x: number, y: number, attr: BeastAttrs): boolean {
  const pixel = getPixelIndex(x, y, WORLD_WIDTH)
  return AdventureEngine.onboardBeast(state, beastId, pixel, [], attr)
}
