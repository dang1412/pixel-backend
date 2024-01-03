import { pixelShooterMatchHandlers } from './PixelShooter'
// import { matchInit, matchJoin, matchJoinAttempt, matchLeave, matchLoop, matchSignal, matchTerminate } from './match_handler'

function InitModule(
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    initializer: nkruntime.Initializer
) {
    logger.info('Hello World!')

    // adventure match
    // initializer.registerMatch('adventure_match', {
    //     matchInit,
    //     matchJoinAttempt,
    //     matchJoin,
    //     matchLeave,
    //     matchLoop,
    //     matchSignal,
    //     matchTerminate
    // })
    // nk.matchCreate('adventure_match')

    // pixel shooter match
    initializer.registerMatch('pixel_shooter_match', pixelShooterMatchHandlers)
    nk.matchCreate('pixel_shooter_match')
}

// Reference InitModule to avoid it getting removed on build
!InitModule && InitModule.bind(null)
