'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { PixelService } from '@/libs/services'
import { useImages } from '@/components/hooks/useImages'
import { ViewShooter } from '@/components/Views/ViewShooter'
import { PixelShooter } from '@/libs/viewport/shooter'

export function ViewShooterWrapper() {
  // const { account } = useLogin()

  const { images, loadImages } = useImages()

  useEffect(() => {
    loadImages()

    return () => {
      (async () => {
        const service = (await PixelService.getInstance()).shooterService
        service.leaveMatch()
      })()
    }
  }, [])

  const onInitGame = useCallback(async (game: PixelShooter) => {
    const service = (await PixelService.getInstance()).shooterService
    await game.load()

    // update controls from server
    service.handleMatchUpdatedCtrls = async (ctrls) => {
      console.log('Handle update ctrls', ctrls)
      game.updateCtrls(ctrls)
    }

    // update positions from server
    service.handleMatchUpdates = async (attrsArr) => {
      console.log('Handle all shooter sync', attrsArr)
      game.updateMatch(attrsArr)
    }

    await service.joinMatch()

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
