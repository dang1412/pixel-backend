'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { PixelService } from '@/libs/services'
import { useImages } from '@/components/hooks/useImages'
import { ViewShooter } from '@/components/Views/ViewShooter'
import { PixelShooter } from '@/libs/viewport/shooter'
import { useLoading } from '@/components/hooks/useLoading'

export function ViewShooterWrapper() {
  // const { account } = useLogin()
  const { updateLoading } = useLoading()
  const gameRef = useRef<PixelShooter>()

  const { images, loadImages } = useImages()

  useEffect(() => {
    loadImages()

    return () => {
      if (gameRef.current) {
        gameRef.current.stopGame()
      }
      (async () => {
        const service = (await PixelService.getInstance()).shooterService
        service.leaveMatch()
      })()
    }
  }, [])

  const onInitGame = useCallback(async (game: PixelShooter) => {
    gameRef.current = game
    const service = (await PixelService.getInstance()).shooterService
    updateLoading(1)
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

    //
    service.handleNewChars = async (types) => {
      console.log('News types', types)
      game.updateTypes(types)
    }

    await service.joinMatch()

    game.requestCtrl = (ctrl) => {
      console.log('requestCtrl', ctrl)
      service.requestCtrl(1, ctrl)
    }
    game.requestAddShooter = (type, x, y) => {
      console.log('requestAddShooter', x, y)
      service.requestAddShooter(type, x, y)
    }

    game.requestTargetMove = (attrs) => {
      console.log('requestTargetMove', attrs)
      service.requestTargetMove(attrs)
    }

    updateLoading(-1)
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
