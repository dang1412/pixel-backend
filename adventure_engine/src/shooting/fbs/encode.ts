import { Builder, ByteBuffer } from 'flatbuffers'

import { CharacterAttrs, ShootingGameStateUpdates } from '../types'
import { PixelShooterUpdatesFbs } from './pixel-shooter-updates-fbs'
import { CharacterAttrsFbs } from './character-attrs-fbs'

export function encodeShootingGameUpdates(stateUpdates: ShootingGameStateUpdates): Uint8Array {
  let builder = new Builder(1024)

  const {
    updateIds,
    updates,
    fireIds,
    deadIds
  } = stateUpdates

  // updateIds
  const updateIdsFbs = PixelShooterUpdatesFbs.createUpdateIdsVector(builder, updateIds)

  // updateAttrs
  PixelShooterUpdatesFbs.startUpdatesVector(builder, updates.length)
  for (const attrs of updates) {
    CharacterAttrsFbs.createCharacterAttrsFbs(builder, attrs.hp, 0, 1, attrs.x, attrs.y)
  }
  const updatesFbs = builder.endVector()

  // fireIds
  const fireIdsFbs = PixelShooterUpdatesFbs.createFireIdsVector(builder, fireIds)

  // deadIds
  const deadIdsFbs = PixelShooterUpdatesFbs.createDeadIdsVector(builder, deadIds)

  PixelShooterUpdatesFbs.startPixelShooterUpdatesFbs(builder)
  PixelShooterUpdatesFbs.addUpdateIds(builder, updateIdsFbs)
  PixelShooterUpdatesFbs.addUpdates(builder, updatesFbs)
  PixelShooterUpdatesFbs.addFireIds(builder, fireIdsFbs)
  PixelShooterUpdatesFbs.addDeadIds(builder, deadIdsFbs)

  const end = PixelShooterUpdatesFbs.endPixelShooterUpdatesFbs(builder)

  builder.finish(end)

  return builder.asUint8Array()
}

export function decodeShootingGameUpdates(data: Uint8Array): ShootingGameStateUpdates {
  const buf = new ByteBuffer(data)
  const pixelShooterUpdatesFbs = PixelShooterUpdatesFbs.getRootAsPixelShooterUpdatesFbs(buf)

  const updateIds = Array.from(pixelShooterUpdatesFbs.updateIdsArray() || [])

  const updates: CharacterAttrs[] = []
  const len = pixelShooterUpdatesFbs.updatesLength()
  for (let i = len - 1; i >= 0; i--) {
    const obj = pixelShooterUpdatesFbs.updates(i)
    updates.push({
      id: 0,
      hp: obj.hp(),
      // angle: obj.angle(),
      // weapon: obj.weapon(),
      x: obj.x(),
      y: obj.y()
    })
  }

  const fireIds = Array.from(pixelShooterUpdatesFbs.fireIdsArray() || [])
  const deadIds = Array.from(pixelShooterUpdatesFbs.deadIdsArray() || [])

  return {
    updateIds,
    updates,
    fireIds,
    deadIds
  }
}
