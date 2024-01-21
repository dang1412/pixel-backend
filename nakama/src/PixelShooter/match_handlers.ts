import { ShootingGameState, encodeControls, decodeControls, proceedControls, CharacterControl, decodeAttrsArray, addShooter, encodeAllShooters, cleanupDeadChars, initGameState, encodeShooterTypes } from 'adventure_engine/dist/shooting'
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
  const game = initGameState()

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
  logger.debug('%q attempted to join Shooter match', ctx.userId)

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
    logger.info('%q joined Shooter match', presence.userId)
  })

  // types
  const typesData = encodeShooterTypes(state.game)
  dispatcher.broadcastMessage(2, typesData, presences)

  // get current position
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
      logger.info('%q left Shooter match', presence.userId)
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

  messages.forEach(m => {
    if (m.opCode === 0) {
      // add new shooter
      const decoded = decodeAttrsArray(m.data)[0]
      logger.info('Received new shooter %v', decoded)
      const attrs = addShooter(state.game, decoded.x, decoded.y, decoded.id)  // id here is used as type
      newIds.push(attrs.id)
    } else if (m.opCode === 1) {
      // control
      const ctrl = decodeControls(m.data)[0]
      logger.info('Received control %v', ctrl)
      ctrls.push(ctrl)
    }
  })

  cleanupDeadChars(state.game)

  // update match states and get changes
  const [updatedCtrls, movedIds] = proceedControls(state.game, ctrls, 25, logger)

  // proceed game loop
  const updatedIds = [...movedIds,...newIds]

  if (newIds.length) {
    logger.info('New chars %v', newIds)
    const data = encodeShooterTypes(state.game, newIds)
    dispatcher.broadcastMessage(2, data)
  }

  if (updatedCtrls.length) {
    logger.info('updatedCtrls %v', updatedCtrls)
    const data = encodeControls(updatedCtrls)
    dispatcher.broadcastMessage(1, data) 
  }

  if (updatedIds.length) {
    logger.info('updatedIds %v', updatedIds)
    const data = encodeAllShooters(state.game, updatedIds)
    dispatcher.broadcastMessage(0, data)
  }

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
  logger.debug('Shooter match terminated')

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