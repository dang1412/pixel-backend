import { describe, expect, test } from '@jest/globals'

import { CharacterControl } from './types'
import { encodeControl, decodeControl } from './encodeFuncs'

describe('ShootingGame - Encode, decode control', () => {
  test('Encode, decode control should work', () => {
    const ctrl: CharacterControl = { u: false, d: true, l: false, r: true, a: 102, f: true, id: 9, w: 1 }
    const encoded = encodeControl(ctrl)
    const decoded = decodeControl(encoded)

    console.log(encoded.byteLength)
    expect(decoded).toEqual(ctrl)
  })
})