import { useCallback, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'

import { PixelInfo } from '@/libs/viewport'
import { PixelService } from '@/libs/services'
import { ownedPixelsState, pixelsState } from '@/libs/states'

import { useLogin } from './useLogin'
import { useLoading } from './useLoading'

interface UsePixelsHook {
  pixels: PixelInfo[]
  ownedPixels: number[]
  loadPixels: () => Promise<any>
}

export function usePixels(): UsePixelsHook {
  const { account } = useLogin()
  const { updateLoading } = useLoading()

  const [pixels, setPixels] = useRecoilState(pixelsState)
  const [ownedPixels, setOwnedPixels] = useRecoilState(ownedPixelsState)

  // load pixels function
  const loadPixels = useCallback(async () => {
    updateLoading(1)
    const service = await PixelService.getInstance()
    const pixels = await service.getPixels()
    setPixels(pixels)
    updateLoading(-1)
  }, [updateLoading])

  // calculate owned pixels when done loading pixels and login/logout
  useEffect(() => {
    (async () => {
      const service = await PixelService.getInstance()
      if (account && service.account) {
        // login
        const addr = service.account.address
        const ownedPixels = pixels.filter(p => p.owner === addr).map(p => p.pixelId)
        // const ownedPixels = await service.getOwnedPixels()
        setOwnedPixels(ownedPixels)
      } else {
        // logout
        setOwnedPixels(o => o.length ? [] : o)
      }
    })()
  }, [account, pixels])

  return { pixels, ownedPixels, loadPixels }
}
