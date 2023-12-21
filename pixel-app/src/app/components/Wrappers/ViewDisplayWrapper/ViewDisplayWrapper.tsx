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

const featuredImages: PixelImage[] = [
  {
    area: {x: 59, y: 43, w: 3, h: 2},
    imageUrl: 'https://api.millionpixelland.com/ipfs/QmVH634xKzsVzwSshgjcoAfHG8fzVWWMdhZCRJGDUfzvMy',
    title: 'Subwallet',
    subtitle: '100x100 grids NFT Billboard with 2D Metaverse gaming ecosystem',
    link: 'https://pixelland.io/'
  },
  {
    area: {x: 56, y: 34, w: 8, h: 3},
    imageUrl: '/images/the-sandbox.jpg',
    title: 'The Sandbox',
    subtitle: 'Creators can monetize voxel ASSETS and gaming experiences on the blockchain',
    link: 'https://www.sandbox.game/en/',
  },
  {
    area: {x: 49, y: 39, w: 6, h: 3},
    imageUrl: '/images/axie.jpg',
    title: 'Axie Infinity',
    subtitle: 'Axie Infinity is a virtual world filled with cute, formidable creatures known as Axies. Axies can be battled, bred, collected, and even used to earn resources & collectibles that can be traded on an open marketplace.',
    link: 'https://axieinfinity.com/',
  }
]

const tabs = ['Featured', 'Owned']

const tabBaseClass = 'inline-block p-4 border-b-2 rounded-t-lg'
const tabInactive = 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
const tabActive = `text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500`

export function ViewDisplayWrapper() {
  const { updateLoading } = useLoading()
  const { notify } = useNotification()

  const { pixels, ownedPixels, loadPixels } = usePixels()

  const { images, ownedImages, loadImages } = useImages()

  const tabContents = [featuredImages, ownedImages]
  const [activeIndex, setActiveIndex] = useState(0)

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

      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">

          {tabs.map((t, i) => (
            <li className='me-2'>
              <span className={`${tabBaseClass} ${activeIndex === i ? tabActive : tabInactive}`} onClick={() => setActiveIndex(i)}>{t}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <ViewMarket images={tabContents[activeIndex]}/>
    </>
  )
}
