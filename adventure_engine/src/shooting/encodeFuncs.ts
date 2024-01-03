import { CharacterAttrs, CharacterControl } from './types'

export function encodeControls(characterControls: CharacterControl[]): ArrayBuffer {
  const buffer = new ArrayBuffer(3 * characterControls.length + 1) // 3 bytes = 24 bits
  const view = new DataView(buffer)

  // first byte is opcode 1
  view.setUint8(0, 1)

  for (let i = 0; i < characterControls.length; i++) {
    const characterControl = characterControls[i]

    // Pack the booleans and weapon into the first byte
    let firstByte = 0
    firstByte |= (characterControl.up ? 1 : 0) << 0    // Up
    firstByte |= (characterControl.down ? 1 : 0) << 1  // Down
    firstByte |= (characterControl.left ? 1 : 0) << 2  // Left
    firstByte |= (characterControl.right ? 1 : 0) << 3 // Right
    firstByte |= (characterControl.fire ? 1 : 0) << 4  // Fire
    firstByte |= (characterControl.weapon & 0x07) << 5 // Weapon (3 bits)
    view.setUint8(3 * i + 1, firstByte)
    
    // Pack the angle (10 bits) and id (6 bits) into the second and third bytes
    let secondAndThirdByte = characterControl.angle & 0x03FF // 10-bit angle
    secondAndThirdByte |= (characterControl.id & 0x3F) << 10 // 6-bit id
    view.setUint16(3 * i + 2, secondAndThirdByte, true) // Little endian
  }

  return buffer
}

export function decodeControls(buffer: ArrayBuffer): CharacterControl[] {
  const view = new DataView(buffer)
  const len = (buffer.byteLength - 1) / 3

  const ctrls: CharacterControl[] = []

  for (let i = 0; i < len; i++) {
    const firstByte = view.getUint8(3 * i + 1)
    const up = (firstByte & 0x01) !== 0
    const down = (firstByte & 0x02) !== 0
    const left = (firstByte & 0x04) !== 0
    const right = (firstByte & 0x08) !== 0
    const fire = (firstByte & 0x10) !== 0
    const weapon = (firstByte >> 5) & 0x07
    
    const secondAndThirdByte = view.getUint16(3 * i + 2, true)
    const angle = secondAndThirdByte & 0x03FF // 10-bit angle
    const id = (secondAndThirdByte >> 10) & 0x3F // 6-bit id
    
    ctrls.push({ up, down, left, right, fire, weapon, angle, id })
  }

  return ctrls
}

export function encodeAttrsArray(attrsArr: CharacterAttrs[]): ArrayBuffer {
  const buffer = new ArrayBuffer(6 * attrsArr.length + 1) // 6 bytes in total
  const view = new DataView(buffer)

  // first byte is opcode 0
  view.setUint8(0, 0)

  for (let i = 0; i < attrsArr.length; i++) {
    const attrs = attrsArr[i]
    // Set the 1-byte values
    view.setUint8(6 * i + 1, attrs.id)   // id (1 byte)
    view.setUint8(6 * i + 2, attrs.hp)   // hp (1 byte)
    
    // Set the 2-byte values
    view.setUint16(6 * i + 3, attrs.x, true) // x (2 bytes, little endian)
    view.setUint16(6 * i + 5, attrs.y, true) // y (2 bytes, little endian)
  }

  return buffer
}

export function decodeAttrsArray(buffer: ArrayBuffer): CharacterAttrs[] {
  const view = new DataView(buffer)
  const len = (buffer.byteLength - 1) / 6

  const attrsArr: CharacterAttrs[] = []
  for (let i = 0; i < len; i++) {

    // Read the 1-byte values
    const id = view.getUint8(6 * i + 1) // id
    const hp = view.getUint8(6 * i + 2) // hp
    
    // Read the 2-byte values
    const x = view.getUint16(6 * i + 3, true) // x (little endian)
    const y = view.getUint16(6 * i + 5, true) // y (little endian)
    
    attrsArr.push({ id, hp, x, y })
  }

  return attrsArr
}

export function getOpcode(buffer: ArrayBuffer): number {
  const view = new DataView(buffer)
  const opcode = view.getUint8(0)

  return opcode
}
