'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { PixelService } from '@/libs/services'
// import { useLogin } from '@/components/hooks'
// import { ViewAdventure } from '@/components/Views/ViewAdventure'
// import { PixelAdventure } from '@/libs/viewport'
import { useImages } from '@/components/hooks/useImages'
import { ViewShooter } from '@/components/Views/ViewShooter'
import { PixelShooter } from '@/libs/viewport/shooter'

export function ViewShooterWrapper() {
  // const { account } = useLogin()
  // const adventureRef = useRef<PixelAdventure>()

  const { images, loadImages } = useImages()

  useEffect(() => {
    loadImages()
  }, [])

  const onInitGame = useCallback(async (game: PixelShooter) => {
    const service = (await PixelService.getInstance()).shooterService
    await game.load()

    // request control
    // const outputCtrl = adv.outputCtrl
    // adv.outputCtrl = (opcode, beastId, pixel, type) => {
    //   outputCtrl(opcode, beastId, pixel, type)
    //   service.requestAction(opcode, beastId, pixel, type)
    // }
    // input from server
    service.handleMatchUpdatedCtrls = async (ctrls) => {
      console.log('Handle update ctrls', ctrls)
      game.updateCtrls(ctrls)
      // game.updateMatch(updates)
      // await adv.updateMatch(updates)
    }

    service.handleMatchUpdates = async (attrsArr) => {
      console.log('Handle all shooter sync', attrsArr)
      game.updateMatch(attrsArr)
    }

    await service.joinMatch()

    // service.requestCtrl(1, { up: false, down: false, left: false, right: true, fire: false, weapon: 2, angle: 10, id: 1 })

    game.requestCtrl = (ctrl) => {
      console.log('requestCtrl', ctrl)
      service.requestCtrl(1, ctrl)
    }
    game.requestAddShooter = (x, y) => {
      console.log('requestAddShooter', x, y)
      service.requestAddShooter(x, y)
    }
  }, [])

  return (
    <>
      <ViewShooter
        onInitGame={onInitGame}
        images={images}
      />
    </>
  )
}
