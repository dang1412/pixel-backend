import { describe, expect, test } from '@jest/globals'
import { AdventureEngine } from './AdventureEngine'

describe('AdventureEngine', () => {
  test('Init state', () => {
    const state = AdventureEngine.initState()
    expect(state.weaponAttrsMap[1]).toEqual({ damage: 1, damageArea: {x: -1, y: -1, w: 3, h: 3} })

    AdventureEngine.onboardBeast(state, 1, 99, [])
    expect(state.beastPixelMap[1]).toBe(99)

    const updates = AdventureEngine.proceedActions(state, [{ beastId: 1, pixel: 100 }], [])
    expect(updates.moves).toEqual([{ beastId: 1, pixel: 100 }])
  })
})
