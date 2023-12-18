// import * as flatbuffers from 'flatbuffers'

// import { AdventureUpdate } from 'adventure_engine'

// import { BeastAction } from './flatbuffer/beast-action'
// import { UpdateState } from './flatbuffer/update-state'

export class TextEncoder {
  encode(input: string): Uint8Array {
    const utf8 = unescape(encodeURIComponent(input))  
    const result = new Uint8Array(utf8.length)  
    for (let i = 0; i < utf8.length; i++) {
      result[i] = utf8.charCodeAt(i)  
    }
    return result  
  }
}

export class TextDecoder {
  decode(input: Uint8Array): string {
    const bytes = new Uint8Array(input)  
    let result = ''  
    for (let i = 0; i < bytes.length; i++) {
      result += String.fromCharCode(bytes[i])  
    }
    try {
      return decodeURIComponent(escape(result))  
    } catch (e) {
      throw new Error('The encoded data was not valid.')  
    }
  }
}

// export function encodeMatchUpdate(updates: AdventureUpdate): Uint8Array {
//   let builder = new flatbuffers.Builder(128)

//   // const executedMoves: ActionInfo[], executedShoots: ActionInfo[], changedBeastIds: number[], changedBeastHps: number[]
//   const { moves: executedMoves, shoots: executedShoots, changedBeastAttrs, changedBeasts: changedBeastIds } = updates
//   const changedBeastHps = changedBeastAttrs.map(attrs => attrs.health)

//   // executedMoves
//   UpdateState.startBeastMovesVector(builder, executedMoves.length)
//   for (const move of executedMoves) {
//     BeastAction.createBeastAction(builder, move.beastId, move.pixel, move.type)
//   }
//   const moves = builder.endVector()

//   // executedShoots
//   UpdateState.startBeastShootsVector(builder, executedShoots.length)
//   for (const shoot of executedShoots) {
//   BeastAction.createBeastAction(builder, shoot.beastId, shoot.pixel, shoot.type)
//   }
//   const shoots = builder.endVector()

//   // beast change
//   const changeIds = UpdateState.createBeastChangeVector(builder, changedBeastIds)
//   const changeHps = UpdateState.createBeastChangeHpVector(builder, changedBeastHps)

//   UpdateState.startUpdateState(builder)
//   UpdateState.addBeastMoves(builder, moves)
//   UpdateState.addBeastShoots(builder, shoots)
//   UpdateState.addBeastChange(builder, changeIds)
//   UpdateState.addBeastChangeHp(builder, changeHps)

//   const end = UpdateState.endUpdateState(builder)

//   builder.finish(end)

//   return builder.asUint8Array()
// }