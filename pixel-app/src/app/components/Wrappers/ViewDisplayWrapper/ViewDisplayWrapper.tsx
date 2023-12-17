'use client'

import { useCallback, useEffect, useState } from 'react'

import { ImageMeta, PixelArea, PixelImage, PixelInfo, WORLD_WIDTH } from '@/libs/viewport'
import { PixelService } from '@/libs/services'
import { NotificationType } from '@/libs/states'

import { useLoading, useLogin } from '@/components/hooks'
import { ViewDisplayDemo } from '@/components/Views/ViewDisplayDemo'
import { ViewMarket } from '@/components/Views/ViewMarket'
import { useNotification } from '@/components/hooks/useNotification'
import { usePixels } from '@/components/hooks/usePixels'
import { useImages } from '@/components/hooks/useImages'

export function ViewDisplayWrapper() {
  const { updateLoading } = useLoading()
  const { notify } = useNotification()

  const { pixels, ownedPixels, loadPixels } = usePixels()

  const { images, ownedImages, loadImages } = useImages()

  useEffect(() => {
    loadPixels()
    loadImages()
  }, [])

  // mint pixels
  const mint = useCallback(async (pixels: number[]) => {
    console.log('mint', pixels)
    updateLoading(1)
    const service = await PixelService.getInstance()
    const error = await service.mint(pixels)

    notify(error ? NotificationType.Error : NotificationType.Success, 'mint', error || `Mint ${pixels} successful`)

    updateLoading(-1)

    return error
  }, [])

  const upload = useCallback(async (url: string, pixel: number, w: number, h: number, meta: ImageMeta, subpixel?: number) => {
    console.log('upload', url, pixel, w, h, meta, subpixel)
    updateLoading(1)
    const service = await PixelService.getInstance()

    notify(NotificationType.Info, 'image-ipfs', `Upload image`)

    // upload image ipfs
    const cid = await service.uploadImageWithUrl(url)

    notify(NotificationType.Info, 'meta-ipfs', `Done uploading image, upload image info`)

    // upload meta ipfs
    const metacid = await service.uploadMeta(meta)
    
    console.log('Upload CID', cid, metacid)
    notify(NotificationType.Info, 'set-image', `Done uploading, updating image onchain`)

    const error = await service.setImage(pixel, w, h, cid, metacid, subpixel)

    updateLoading(-1)

    notify(error ? NotificationType.Error : NotificationType.Success, 'setImage', error || `setImage ${w}x${h} successful`)

    return error
  }, [])

  const loadSubImages = useCallback(async (area: PixelArea) => {
    console.log('loadSubImages', area)
    const service = await PixelService.getInstance()

    return service.getSubImages(area, WORLD_WIDTH)
  }, [])

  return (
    <>
      <ViewDisplayDemo
        pixels={pixels}
        ownedPixels={ownedPixels}
        images={images}
        mint={mint}
        upload={upload}
        loadSubImages={loadSubImages}
      />
      <ViewMarket images={ownedImages}/>
    </>
  )
}
