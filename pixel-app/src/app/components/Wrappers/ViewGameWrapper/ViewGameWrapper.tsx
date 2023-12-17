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

  const { images, ownedImages, loadImages } = useImages()

  useEffect(() => {
    loadImages()
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
    service.setHandleUpdate(async (moves, shoots, deaths) => {
      console.log('Handle update', moves, shoots)
      // clear select before execute actions
      adv.map.scene.clearSelect()
      await Promise.all(moves.map(m => adv.move(m[0], m[1])))
      await Promise.all(shoots.map(s => adv.shoot(s[0], s[1])))

      for (const id of deaths) {
        adv.kill(id)
      }
    })
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
