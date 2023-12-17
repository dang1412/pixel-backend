import { describe, expect, test } from '@jest/globals'
import { AdventureEngine } from './AdventureEngine'
import { decodeMatchUpdate, encodeMatchUpdate } from './flatbuffer/encode'
import { AdventureUpdate } from './types'

describe('AdventureEngine', () => {
  test('initState state', () => {
    const state = AdventureEngine.initState()
    expect(state.weaponAttrsMap[1]).toEqual({ damage: 1, damageArea: {x: -1, y: -1, w: 3, h: 3} })
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

    const updates = AdventureEngine.proceedActions(state, [{ beastId: 1, pixel: 99 }], [])
    expect(updates.moves).toEqual([{ beastId: 1, pixel: 99 }])
  })

  test('getAllBeastPositions should work', () => {
    const state = AdventureEngine.initState()

    AdventureEngine.onboardBeast(state, 1, 99, [])
    AdventureEngine.onboardBeast(state, 2, 120, [])
    expect(state.beastPixelMap[1]).toBe(99)
    expect(state.pixelBeastMap[99]).toBe(1)

    expect(state.beastPixelMap[2]).toBe(120)
    expect(state.pixelBeastMap[120]).toBe(2)

    const _updates = AdventureEngine.proceedActions(state, [{ beastId: 1, pixel: 100 }], [])
    AdventureEngine.onboardBeast(state, 3, 99, [])

    const pos = AdventureEngine.getAllBeastPositions(state)
    expect(pos).toEqual([{ beastId: 1, pixel: 100 }, { beastId: 2, pixel: 120 }, { beastId: 3, pixel: 99 }])
  })

  test('flatbuffer encode/decode should work', () => {
    const updates: AdventureUpdate = {
      moves: [{ beastId: 1, pixel: 100, type: 10 }, { beastId: 2, pixel: 120, type: 100 }],
      shoots: [{ beastId: 5, pixel: 200, type: 1 }],
      changedBeasts: [1],
      changedBeastAttrs: [{health: 2}]
    }
    const encoded = encodeMatchUpdate(updates)
    const decoded = decodeMatchUpdate(encoded)
    console.log(decoded)
    // sort the moves array by beastId
    decoded.moves.sort((a, b) => a.beastId - b.beastId)
    // compare
    expect(decoded).toEqual(updates)
  })
})
