'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { PixelService } from '@/libs/services'
import { useLogin } from '@/components/hooks'
import { ViewAdventure } from '@/components/Views/ViewAdventure'
import { PixelAdventure } from '@/libs/viewport'
import { useImages } from '@/components/hooks/useImages'

export function ViewGameWrapper() {
  const { account } = useLogin()
  const adventureRef = useRef<PixelAdventure>()

  const { images, loadImages } = useImages()

  useEffect(() => {
    loadImages()

    return () => {
      (async () => {
        const service = (await PixelService.getInstance()).adventureService
        service.leaveMatch()
      })()
    }
  }, [])

  const onInitAdventure = useCallback(async (adv: PixelAdventure) => {
    console.log('onInitAdventure', adv)
    adventureRef.current = adv
    const service = (await PixelService.getInstance()).adventureService
    service.joinMatch()

    // output beast control
    const outputCtrl = adv.outputCtrl
    adv.outputCtrl = (opcode, beastId, pixel, type) => {
      outputCtrl(opcode, beastId, pixel, type)
      service.requestAction(opcode, beastId, pixel, type)
    }

    // input from server
    service.handleMatchUpdates = async (updates) => {
      console.log('Handle update', updates)
      await adv.updateMatch(updates)
    }
  }, [])

  return (
    <>
      <ViewAdventure
        onInitAdventure={onInitAdventure}
        images={images}
      />
    </>
  )
}
