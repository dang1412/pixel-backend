import { describe, expect, test } from '@jest/globals'

import { CharacterAttrs, CharacterControl } from './types'
import { encodeControls, decodeControls, encodeAttrsArray, decodeAttrsArray, getOpcode } from './encodeFuncs'

describe('ShootingGame - Encode, decode control', () => {
  test('Encode, decode control array should work', () => {
    const ctrls: CharacterControl[] = [
      { up: false, down: true, left: false, right: true, angle: 800, fire: true, id: 9, weapon: 1 },
      { up: false, down: true, left: false, right: true, angle: 500, fire: true, id: 1, weapon: 2 },
    ]
    const encoded = encodeControls(ctrls)
    const decoded = decodeControls(encoded)

    console.log(encoded.byteLength)
    expect(decoded).toEqual(ctrls)
    expect(getOpcode(encoded)).toBe(1)
  })

  test('Encode, decode attrs array should work', () => {
    const attrsArr: CharacterAttrs[] = [
      { id: 1, hp: 100, x: 1200, y: 1400 },
      { id: 2, hp: 90, x: 1500, y: 1200 },
    ]

    const encoded = encodeAttrsArray(attrsArr)
    const decoded = decodeAttrsArray(encoded)

    expect(decoded).toEqual(attrsArr)
    expect(getOpcode(encoded)).toBe(0)
  })
})