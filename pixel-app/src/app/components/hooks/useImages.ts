import { useCallback, useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

import { PixelImage, WORLD_WIDTH } from '@/libs/viewport'
import { PixelService } from '@/libs/services'
import { getImagesFromPixels, ownedPixelsState } from '@/libs/states'

import { useLoading } from './useLoading'

interface UseImagesHook {
  images: PixelImage[]
  ownedImages: PixelImage[]
  loadImages: () => Promise<any>
}

export function useImages(): UseImagesHook {
  const { updateLoading } = useLoading()

  const ownedPixels = useRecoilValue(ownedPixelsState)
  const [images, setImages] = useState<PixelImage[]>([])
  const [ownedImages, setOwnedImages] = useState<PixelImage[]>([])

  // load images function
  const loadImages = useCallback(async () => {
    updateLoading(1)
    const service = await PixelService.getInstance()
    const [images] = await service.getImages(WORLD_WIDTH)
    setImages(images)
    updateLoading(-1)
  }, [updateLoading])

  // calculate owned images when done loading images and log in
  useEffect(() => {
    if (images.length && ownedPixels.length) {
      // const i = ownedPixels.map(p => appGlobal.imageMap.get(p)).filter(i => i !== undefined)
      const ownedImages = getImagesFromPixels(ownedPixels)

      setOwnedImages(ownedImages)
    }
  }, [ownedPixels, images])

  return { images, ownedImages, loadImages }
}
