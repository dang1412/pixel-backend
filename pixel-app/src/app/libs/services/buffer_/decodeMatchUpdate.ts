import { ByteBuffer } from 'flatbuffers'
import { UpdateState } from './update-state'

export function decodeMatchUpdate(data: Uint8Array): [[number, number][], [number, number][], number[]] {
  const buf = new ByteBuffer(data)
  const updateState = UpdateState.getRootAsUpdateState(buf)

  const moveLen = updateState.beastMovesLength()
  const moves: [number, number][] = []
  for (let i = 0; i < moveLen; i++) {
    const moveObj = updateState.beastMoves(i)
    if (moveObj) {
      moves.push([moveObj.id(), moveObj.target()])
    }
  }

  const shootLen = updateState.beastShootsLength()
  const shoots: [number, number][] = []
  for (let i = 0; i < shootLen; i++) {
    const shootObj = updateState.beastShoots(i)
    if (shootObj) {
      shoots.push([shootObj.id(), shootObj.target()])
    }
  }

  const deaths = Array.from(updateState.beastDeathsArray() || [])

  return [moves, shoots, deaths]
}
