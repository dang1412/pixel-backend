import { Builder, ByteBuffer } from 'flatbuffers'

import { ActionInfo, AdventureUpdate } from '../types'
import { BeastAction, UpdateState } from './match-update'

/**
 * Encode match updates
 * @param updates 
 * @returns 
 */
export function encodeMatchUpdate(updates: AdventureUpdate): Uint8Array {
  let builder = new Builder(1024)

  // const executedMoves: ActionInfo[], executedShoots: ActionInfo[], changedBeastIds: number[], changedBeastHps: number[]
  const { moves: executedMoves, shoots: executedShoots, changedBeastAttrs, changedBeasts: changedBeastIds } = updates
  const changedBeastHps = changedBeastAttrs.map(attrs => attrs.health)

  // executedMoves
  UpdateState.startBeastMovesVector(builder, executedMoves.length)
  for (const move of executedMoves) {
    BeastAction.createBeastAction(builder, move.beastId, move.pixel, move.type)
  }
  const moves = builder.endVector()

  // executedShoots
  UpdateState.startBeastShootsVector(builder, executedShoots.length)
  for (const shoot of executedShoots) {
    BeastAction.createBeastAction(builder, shoot.beastId, shoot.pixel, shoot.type)
  }
  const shoots = builder.endVector()

  // beast change
  const changeIds = UpdateState.createBeastChangeVector(builder, changedBeastIds)
  const changeHps = UpdateState.createBeastChangeHpVector(builder, changedBeastHps)

  UpdateState.startUpdateState(builder)
  UpdateState.addBeastMoves(builder, moves)
  UpdateState.addBeastShoots(builder, shoots)
  UpdateState.addBeastChange(builder, changeIds)
  UpdateState.addBeastChangeHp(builder, changeHps)

  const end = UpdateState.endUpdateState(builder)

  builder.finish(end)

  return builder.asUint8Array()
}

/**
 * Decode match updates
 * @param data
 * @returns 
 */
export function decodeMatchUpdate(data: Uint8Array): AdventureUpdate {
  const buf = new ByteBuffer(data)
  const updateState = UpdateState.getRootAsUpdateState(buf)

  const moveLen = updateState.beastMovesLength()
  const moves: ActionInfo[] = []
  for (let i = 0; i < moveLen; i++) {
    const moveObj = updateState.beastMoves(i)
    if (moveObj) {
      moves.push({ beastId: moveObj.id(), pixel: moveObj.target(), type: moveObj.type() })
    }
  }

  const shootLen = updateState.beastShootsLength()
  const shoots: ActionInfo[] = []
  for (let i = 0; i < shootLen; i++) {
    const shootObj = updateState.beastShoots(i)
    if (shootObj) {
      shoots.push({ beastId: shootObj.id(), pixel: shootObj.target(), type: shootObj.type() })
    }
  }

  const changedBeasts = Array.from(updateState.beastChangeArray() || [])
  const changedBeastHps = Array.from(updateState.beastChangeHpArray() || [])
  const changedBeastAttrs = changedBeastHps.map(health => ({ health }))

  // return [moves, shoots, changedBeastIds, changedBeastHps]
  return {
    moves,
    shoots,
    changedBeasts,
    changedBeastAttrs
  }
}
