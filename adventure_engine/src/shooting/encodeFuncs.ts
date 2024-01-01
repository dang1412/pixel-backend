import { CharacterControl } from './types'

export function encodeControl(characterControl: CharacterControl): ArrayBuffer {
  const buffer = new ArrayBuffer(4) // 4 bytes
  const view = new DataView(buffer)

  // Pack booleans and weapon into the first byte
  let packed = 0
  packed |= (characterControl.u ? 1 : 0) << 0 // Up
  packed |= (characterControl.d ? 1 : 0) << 1 // Down
  packed |= (characterControl.l ? 1 : 0) << 2 // Left
  packed |= (characterControl.r ? 1 : 0) << 3 // Right
  packed |= (characterControl.f ? 1 : 0) << 4 // Fire
  packed |= (characterControl.w & 0x07) << 5 // Weapon (3 bits)

  view.setUint8(0, packed)

  // Next, pack the 15-bit ID and the first 1 bit of angle into the next 2 bytes
  let idAndPartOfAngle = characterControl.id & 0x7FFF // 15-bit ID
  idAndPartOfAngle |= (characterControl.a & 0x01) << 15 // 1 bit of angle
  view.setUint16(1, idAndPartOfAngle, true) // Little endian

  // Finally, pack the remaining 8 bits of angle into the last byte
  view.setUint8(3, characterControl.a >> 1) // Remaining 8 bits of angle

  return buffer
}

export function decodeControl(buffer: ArrayBuffer): CharacterControl {
  const view = new DataView(buffer)

  const packed = view.getUint8(0)
  const u = (packed & (1 << 0)) !== 0
  const d = (packed & (1 << 1)) !== 0
  const l = (packed & (1 << 2)) !== 0
  const r = (packed & (1 << 3)) !== 0
  const f = (packed & (1 << 4)) !== 0
  const w = (packed >> 5) & 0x07 // Weapon

  const idAndPartOfAngle = view.getUint16(1, true)
  const id = idAndPartOfAngle & 0x7FFF // 15-bit ID
  let a = (idAndPartOfAngle >> 15) & 0x01 // 1 bit of angle
  a |= view.getUint8(3) << 1 // Remaining 8 bits of angle

  return { u, d, l, r, f, w, id, a }
}
