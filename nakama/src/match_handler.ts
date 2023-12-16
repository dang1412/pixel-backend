// import { TextEncoder, TextDecoder } from './encode.js'
// import * as flatbuffers from 'flatbuffers'
import { ActionInfo, AdventureEngine } from 'adventure_engine'

import { TextEncoder, TextDecoder, encodeMatchUpdate } from './encode'
// import { UpdateState, BeastAction } from './flatbuffer/match-update'

interface MatchState {
  presences: {[userId: string]: nkruntime.Presence}
  adventure: AdventureEngine
}


export function matchInit(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  params: {[key: string]: string},
): {state: MatchState, tickRate: number, label: string} {
  logger.debug('Lobby match created')

  const presences: {[userId: string]: nkruntime.Presence} = {}
  const adventure = new AdventureEngine()

  return {
      state: { presences, adventure },
      tickRate: 1,
      label: 'PixelAdventure'
  }
}

export function matchJoinAttempt(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: MatchState,
  presence: nkruntime.Presence,
  metadata: {[key: string]: any }
) : {state: MatchState, accept: boolean, rejectMessage?: string | undefined } | null {
  logger.debug('%q attempted to join Lobby match', ctx.userId)

  return {
      state,
      accept: true
  }
}

export function matchJoin(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: MatchState,
  presences: nkruntime.Presence[]
) : { state: MatchState } | null {
  presences.forEach((presence) => {
    state.presences[presence.userId] = presence
    logger.info('%q joined Adventure match', presence.userId)
  })
  // const positions: BeastActionI[] = Object.keys(state.beastPosition).map(id => Number(id)).map(id => ({id, target: state.beastPosition[id]}))
  const positions = state.adventure.getAllBeastPositions()

  const data = encodeMatchUpdate({moves: positions, shoots: [], changedBeasts: [], changedBeastAttrs: []})

  dispatcher.broadcastMessage(0, data.buffer.slice(data.byteOffset), presences, undefined, true)

  return {
    state
  }
}

export function matchLeave(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: MatchState,
  presences: nkruntime.Presence[]
) : { state: MatchState } | null {
  presences.forEach((presence) => {
      delete (state.presences[presence.userId])
      logger.info('%q left adventure match', presence.userId)
  })

  // remove all beast belongs to this user

  return {
    state
  }
}

// function executeMove(state: AdventureEngine, move: BeastActionI) {
//   const { id, target } = move
//   const from = state.beastPosition[id]

//   state.beastPosition[id] = target
//   state.positionBeast[target] = id

//   delete state.positionBeast[from]
// }

// function executeShoot(state: AdventureEngine, shoot: BeastActionI): number | undefined {
//   const { target } = shoot
//   if (state.positionBeast[target] >= 0) {
//     // shoot
//     const die = state.positionBeast[target]
//     delete state.positionBeast[target]
//     delete state.beastPosition[die]

//     return die
//   }

//   return undefined
// }

// function matchUpdate(
//   state: AdventureEngine, moves: BeastActionI[], shoots: BeastActionI[]
// ): { executedMoves: BeastActionI[], executedShoots: BeastActionI[], beastGone: number[] } {
//   const executedMoves: BeastActionI[] = []

//   for (const move of moves) {
//     const { target } = move
//     if (state.positionBeast[target] === undefined) {
//       // can move
//       executeMove(state, move)
//       executedMoves.push(move)
//     }
//   }

//   const executedShoots: BeastActionI[] = []
//   const beastGone: number[] = []

//   for (const shoot of shoots) {
//     const { id } = shoot
//     if (state.beastPosition[id] >= 0) {
//       // alive
//       const die = executeShoot(state, shoot)
//       executedShoots.push(shoot)

//       if (die) {
//         beastGone.push(die)
//       }
//     }
//   }

//   return { executedMoves, executedShoots, beastGone }
// }

// function encodeMatchUpdate(executedMoves: BeastActionI[], executedShoots: BeastActionI[], beastGone: number[]): Uint8Array {
//   let builder = new flatbuffers.Builder(128)

//   // executedMoves
//   UpdateState.startBeastMovesVector(builder, executedMoves.length)
//   for (const move of executedMoves) {
//     BeastAction.createBeastAction(builder, move.id, move.target)
//   }
//   const moves = builder.endVector()

//   // executedShoots
//   UpdateState.startBeastShootsVector(builder, executedShoots.length)
//   for (const shoot of executedShoots) {
//     BeastAction.createBeastAction(builder, shoot.id, shoot.target)
//   }
//   const shoots = builder.endVector()

//   // beastGone
//   const deaths = UpdateState.createBeastDeathsVector(builder, beastGone)

//   UpdateState.startUpdateState(builder)
//   UpdateState.addBeastMoves(builder, moves)
//   UpdateState.addBeastShoots(builder, shoots)
//   UpdateState.addBeastDeaths(builder, deaths)

//   const end = UpdateState.endUpdateState(builder)

//   builder.finish(end)

//   return builder.asUint8Array()
// }

// Encoding Function
// function encodeAction(id: number, target: number): Uint8Array {
//   const buffer = new ArrayBuffer(8)
//   const view = new DataView(buffer)

//   view.setInt32(0, id, true)
//   view.setInt32(4, target, true)

//   return new Uint8Array(buffer)
// }

// Decoding Function
function decodeAction(data: Uint8Array): ActionInfo {
  const buffer = data.buffer
  const view = new DataView(buffer)

  const beastId = view.getInt32(0, true)
  const pixel = view.getInt32(4, true)

  return { beastId, pixel }
}

// function decodeBeastAction(data: Uint8Array): BeastActionI {
//   const buffer = new flatbuffers.ByteBuffer(data)
//   const beastAction = new BeastAction()
//   beastAction.__init(0, buffer)

//   return {
//     id: beastAction.id(),
//     target: beastAction.target()
//   }
// }

export function matchLoop(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: MatchState,
  messages: nkruntime.MatchMessage[]
) : { state: MatchState} | null {
  // logger.debug('Lobby match loop executed')

  // Object.keys(state.presences).forEach((key) => {
  //     const presence = state.presences[key]
  //     logger.info('Presence %v name $v', presence.userId, presence.username)
  // })

  // get move, shoot actions from messages
  const moves: ActionInfo[] = []
  const shoots: ActionInfo[] = []

  messages.forEach((message) => {
      // const msg = JSON.parse(nk.binaryToString(message.data))
      // logger.info(msg)
      // logger.info('Received %v from %v', JSON.parse(nk.binaryToString(message.data)), message.sender.userId)
      // dispatcher.broadcastMessage(1, message.data, [message.sender], null)
      const beastAction = decodeAction(new Uint8Array(message.data))
      if (message.opCode === 0) {
        moves.push(beastAction)
      } else {
        shoots.push(beastAction)
      }

      logger.info('Received action %v', beastAction, message.opCode)
  })

  // update match states and get changes
  // const { executedMoves, executedShoots, beastGone } = matchUpdate(state, moves, shoots)
  const updates = state.adventure.proceedActions(moves, shoots)

  if (updates.moves.length || updates.shoots.length || updates.changedBeasts.length) {
    const data = encodeMatchUpdate(updates)
    // const buff = new flatbuffers.ByteBuffer(data)
    // const updateState = UpdateState.getRootAsUpdateState(buff)

    // const move = updateState.beastMoves(0)
    // logger.info(`got ${move.id()}, ${move.target()}`)

    dispatcher.broadcastMessage(1, data.buffer.slice(data.byteOffset))
  }

  // logger.info('Received %v', executedMoves)

  // broadcast changes to clients
  

  // logger.info(b.decode(d))

  // UpdateState.createBeastMovesVector(builder, [action])

  return {
    state
  }
}

export function matchTerminate(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: MatchState,
  graceSeconds: number
) : { state: MatchState} | null {
  logger.debug('Lobby match terminated')

  const message = `Server shutting down in ${graceSeconds} seconds.`
  dispatcher.broadcastMessage(2, message, null, null)

  return {
      state
  }
}

export function matchSignal(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: MatchState,
  data: string
) : { state: MatchState, data?: string } | null {
  logger.debug('Lobby match signal received: ' + data)

  return {
      state,
      data: "Lobby match signal received: " + data
  }
}

!TextEncoder && TextEncoder.bind(null);
!TextDecoder && TextDecoder.bind(null);
