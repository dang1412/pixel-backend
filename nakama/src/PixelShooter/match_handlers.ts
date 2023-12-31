import { ShootingGameState, encodeControls, decodeControls, proceedControls, CharacterControl, decodeAttrsArray, addShooter, encodeAllShooters, proceedGameLoop } from 'adventure_engine/dist/shooting'
// import { TextDecoder, TextEncoder } from '../encode'

interface MatchState {
  presences: {[userId: string]: nkruntime.Presence}
  game: ShootingGameState
}

function matchInit(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  params: {[key: string]: string},
): {state: MatchState, tickRate: number, label: string} {
  logger.debug('PixelShooter match created')

  const presences: {[userId: string]: nkruntime.Presence} = {}
  const game: ShootingGameState = {
    characterAttrsMap: {},
    characterCtrlMap: {}
  }

  return {
      state: { presences, game },
      tickRate: 5,
      label: 'PixelShooter'
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

  // dispatcher.broadcastMessage(0, data.buffer.slice(data.byteOffset), presences, undefined, true)
  // TODO get current game state
  const data = encodeAllShooters(state.game)
  dispatcher.broadcastMessage(0, data, presences)

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

  return {
    state
  }
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
  const ctrls: CharacterControl[] = []
  const newIds: number[] = []
  // const newShooters: CharacterAttrs[] = []

  messages.forEach(m => {
    if (m.opCode === 0) {
      // add new shooter
      const decoded = decodeAttrsArray(m.data)[0]
      logger.info('Received new shooter %v', decoded)
      const attrs = addShooter(state.game, decoded.x, decoded.y)
      newIds.push(attrs.id)
    } else if (m.opCode === 1) {
      // control
      const ctrl = decodeControls(m.data)[0]
      logger.info('Received control %v', ctrl)
      ctrls.push(ctrl)
    }
  })
  
  // messages.map(m => decodeControls(m.data)[0])
  // ctrls.forEach((ctrl) => {
  //   logger.info('Received action %v', ctrl)
  // })

  // update match states and get changes
  const updatedCtrls = proceedControls(state.game, ctrls)

  // proceed game loop
  const movedIds = proceedGameLoop(state.game)
  const updatedIds = [...movedIds,...newIds]

  if (updatedCtrls.length) {
    // const data = encodeShootingGameUpdates(updates)
    const data = encodeControls(updatedCtrls)
    dispatcher.broadcastMessage(1, data)
  }

  if (updatedIds.length) {
    logger.info('updatedIds %v', updatedIds)
    const data = encodeAllShooters(state.game, updatedIds)
    if (data.byteLength > 1) dispatcher.broadcastMessage(0, data)
  }

  // if (tick % 40 === 0) {
  //   // send all attrs data to all clients
  //   const data = encodeAllShooters(state.game)
  //   if (data.byteLength > 1) dispatcher.broadcastMessage(0, data)
  // }

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
  logger.debug('PixelShooter match signal received: ' + data)

  return {
      state,
      data: "PixelShooter match signal received: " + data
  }
}

export const pixelShooterMatchHandlers: nkruntime.MatchHandler<MatchState> = {
  matchInit,
  matchJoinAttempt,
  matchJoin,
  matchLeave,
  matchLoop,
  matchSignal,
  matchTerminate
}

// !TextEncoder && TextEncoder.bind(null);
// !TextDecoder && TextDecoder.bind(null);