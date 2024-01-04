import { describe, expect, test } from '@jest/globals'
import { encodeShootingGameUpdates, decodeShootingGameUpdates } from './encode'
import { ShootingGameStateUpdates } from '../types'

describe('ShootingGame - Encode, decode game updates', () => {
  test('ShootingGame - Encode, decode should work', () => {
    const shootingGameUpdates: ShootingGameStateUpdates = {
      updateIds: [1,2],
      updates: [
        { hp: 100, angle: 90, weapon: 1, x: 50, y: 52 },
        { hp: 90, angle: 60, weapon: 2, x: 25, y: 30 },
        { hp: 60, angle: 80, weapon: 4, x: 30, y: 40 },
      ],
      fireIds: [3, 5],
      deadIds: [4, 6]
    }

    const data = encodeShootingGameUpdates(shootingGameUpdates)

    const decoded = decodeShootingGameUpdates(data)

    console.log(decoded)
    expect(decoded).toEqual(shootingGameUpdates)

  })
})