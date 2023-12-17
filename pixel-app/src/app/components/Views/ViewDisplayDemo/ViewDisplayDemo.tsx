import React, { useCallback, useEffect, useState } from 'react'
import { FaTurnUp } from 'react-icons/fa6'

import { appGlobal } from '@/libs/states/globals'
import { EngineViewport, ImageMeta, PixelArea, PixelImage, PixelInfo, PixelMap } from '@/libs/viewport'
import { ViewportWorld } from '../ViewportWorld'
import { PixelOver } from '../PixelOver'

import { useLoading, useLogin } from '@/components/hooks'
import { mockImages } from './data'
import { PixelSelect } from './PixelSelect'
import { getImagesFromPixels } from '@/libs/states'

interface Props {
  pixels?: PixelInfo[]
  ownedPixels?: number[]
  images?: PixelImage[]
  mint: (pixels: number[]) => Promise<string>
  upload: (url: string, pixel: number, w: number, h: number, meta: ImageMeta, subpixel?: number) => Promise<string>
  loadSubImages: (area: PixelArea) => Promise<PixelImage[]>
}

export const ViewDisplayDemo: React.FC<Props> = (props) => {
  const {
    pixels = [],
    ownedPixels = [],
    images = [],
    mint,
    upload,
    loadSubImages,
   } = props

  const { account } = useLogin()
  const [pixelMap, setPixelMap] = useState<PixelMap>()
  const { updateLoading } = useLoading()

  // got the engine with main map
  const onInit = useCallback(async (e: EngineViewport) => {
    // store engine into global
    appGlobal.engine = e
    const mainMap = new PixelMap(e, 0)
    // add pixel layer first
    mainMap.scene.getLayerContainer('pixel')
    // then image layer
    mainMap.addImages(mockImages)

    setPixelMap(mainMap)
  }, [])

  // update owned pixels and hightlight
  useEffect(() => {
    if (pixelMap) {
      if (pixelMap.parentMap && pixelMap.areaInParent) {
        // sub map, update owner if needed
        const parentMap = pixelMap.parentMap
        const { x, y } = pixelMap.areaInParent
        const imgTopLeftPixel = parentMap.scene.getPixelIndex(x, y)
        if (ownedPixels.includes(imgTopLeftPixel)) {
          // update owner
          pixelMap.owner = account.addr
        }
      } else {
        // main map
        console.log('hightlightOwnedPixels', pixels, account)
        
        // update pixels owner
        // TODO do this only once
        pixelMap.updateMintedPixels(pixels)
        pixelMap.hightlightOwnedPixels(account.addr)
      }
    }
  }, [pixelMap, account, pixels, ownedPixels])

  // load images
  useEffect(() => {
    if (pixelMap && !pixelMap.parentMap) {
      // TODO do this only once
      // only main map
      pixelMap.addImages(images)
    }
  }, [pixelMap, images])

  // Float Dialog
  const getFloatDialog = useCallback((area: PixelArea, closeSelect: () => void) => {
    if (!pixelMap) return <></>

    return area.w === 0 && area.h === 0 ? (
      <PixelOver x={area.x} y={area.y} map={pixelMap}/>
    ): (
      <PixelSelect
        pixelMap={pixelMap}
        area={area}
        closeSelect={closeSelect}
        mint={mint}
        upload={upload}
      />
    )
  }, [pixelMap, mint, upload])

  // Handle pixel click event
  const onPixelClick = useCallback(async (x: number, y: number) => {
    if (!pixelMap) return
    
    // start loading
    updateLoading(1)

    // load subimages if not loaded
    const image = pixelMap.getImage(x, y)
    if (image && image.subImages === undefined) {
      image.subImages = await loadSubImages(image.area)
    }

    const nextMap = await pixelMap.openPixel(x, y)
    if (nextMap) {
      // update pixel map if open success
      setPixelMap(nextMap)
    }

    // done loading
    updateLoading(-1)
  }, [pixelMap])

  const goParentMap = useCallback(() => {
    const parentMap = pixelMap?.goParentMap()
    if (parentMap) {
      setPixelMap(parentMap)
    }
  }, [pixelMap])

  return (
    <ViewportWorld
      onInit={onInit}
      onPixelClick={onPixelClick}
      getDisplayFloat={getFloatDialog}
      customViewTools={
        <>
          {pixelMap && pixelMap.parentMap && <button onClick={goParentMap} title='Go up'><FaTurnUp /></button>}
        </>
      }
      worldWidthPixel={100}
      worldHeightPixel={100}
      pixelSize={20}
    />
  )
}
