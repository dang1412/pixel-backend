import { ActionInfo, AdventureEngine, AdventureState, encodeMatchUpdate } from 'adventure_engine'

import { TextEncoder, TextDecoder } from './encode'

interface MatchState {
  presences: {[userId: string]: nkruntime.Presence}
  adventure: AdventureState
}

function matchInit(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  params: {[key: string]: string},
): {state: MatchState, tickRate: number, label: string} {
  logger.debug('Adventure match created')

  const presences: {[userId: string]: nkruntime.Presence} = {}
  const adventure = AdventureEngine.initState()

  return {
      state: { presences, adventure },
      tickRate: 1,
      label: 'PixelAdventure'
  }
}

function matchJoinAttempt(
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

function matchJoin(
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
  const positions = AdventureEngine.getAllBeastPositions(state.adventure)
  const props = AdventureEngine.getAllBeastProps(state.adventure)
  const [pixels, items] = AdventureEngine.getAllPixelItems(state.adventure)

  const data = encodeMatchUpdate({
    moves: positions,
    shoots: [],
    changedBeasts: props[0],
    changedBeastHps: props[1],
    changedBeastEquips: props[2],
    changedPixels: pixels,
    changedPixelItems: items,
  })

  dispatcher.broadcastMessage(0, data.buffer.slice(data.byteOffset), presences, undefined, true)

  return {
    state
  }
}

function matchLeave(
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

// Decoding Function
function decodeAction(data: Uint8Array): ActionInfo {
  const buffer = data.buffer
  const view = new DataView(buffer)

  const beastId = view.getInt32(0, true)
  const pixel = view.getInt32(4, true)

  return { beastId, pixel }
}

function matchLoop(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: MatchState,
  messages: nkruntime.MatchMessage[]
) : { state: MatchState } | null {
  // get move, shoot actions from messages
  const moves: ActionInfo[] = []
  const shoots: ActionInfo[] = []
  const onboardMoves: ActionInfo[] = []

  const dropItems: ActionInfo[] = []
  const dropEquipBeasts: number[] = []

  messages.forEach((message) => {
    const beastAction = decodeAction(new Uint8Array(message.data))
    beastAction.type = state.adventure.beastEquipItemMap[beastAction.beastId] || 0
    if (message.opCode === 0) {
      moves.push(beastAction)
    } else if (message.opCode === 1) {
      shoots.push(beastAction)
    } else if (message.opCode === 2) {
      logger.info('Onboard beast %v', beastAction)
      // TODO check if onboard beast success
      const onboarded = AdventureEngine.onboardBeast(state.adventure, beastAction.beastId, beastAction.pixel, [])
      if (onboarded) onboardMoves.push(beastAction)
    } else if (message.opCode === 99) {
      logger.info('Drop item %v', beastAction)
      // const isDropped = AdventureEngine.dropItemOnMap(state.adventure, beastAction.beastId, beastAction.pixel)
      dropItems.push(beastAction)
    } else if (message.opCode === 199) {
      logger.info('Beast Drop item %v', beastAction)
      // const isDropped = AdventureEngine.dropItemOnMap(state.adventure, beastAction.beastId, beastAction.pixel)
      dropEquipBeasts.push(beastAction.beastId)
    }

    logger.info('Received action %v', beastAction, message.opCode)
  })

  // update match states and get changes
  // const { executedMoves, executedShoots, beastGone } = matchUpdate(state, moves, shoots)
  const updates = AdventureEngine.proceedActions(state.adventure, moves, shoots, dropEquipBeasts)
  updates.moves.push(...onboardMoves)

  // process drop items
  AdventureEngine.proceedDropItem(state.adventure, dropItems, updates)
  // for (const action of dropItems) {
  //   const { beastId: itemId, pixel } = action
  //   const isDropped = AdventureEngine.dropItemOnMap(state.adventure, itemId, pixel)
  //   if (isDropped) {
  //     updates.changedPixels.push(pixel)
  //     updates.changedPixelItems.push(itemId)
  //   }
  // }

  if (updates.moves.length || updates.shoots.length || updates.changedBeasts.length || updates.changedPixels.length) {
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

function matchTerminate(
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

function matchSignal(
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

export const pixelAdventureMatchHandlers: nkruntime.MatchHandler<MatchState> = {
  matchInit,
  matchJoinAttempt,
  matchJoin,
  matchLeave,
  matchLoop,
  matchSignal,
  matchTerminate
}