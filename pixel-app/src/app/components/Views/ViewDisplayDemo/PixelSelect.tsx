import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { FaXmark } from 'react-icons/fa6'

import { ImageMeta, PixelArea, PixelImage, PixelMap, getSubPixel } from '@/libs/viewport'
import { useLogin } from '@/components/hooks'

interface Props {
  pixelMap: PixelMap
  area: PixelArea
  closeSelect: () => void
  mint: (pixels: number[]) => Promise<string>
  upload: (url: string, pixel: number, w: number, h: number, meta: ImageMeta, subpixel?: number) => Promise<string>
}

const buttonClass = "bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white text-sm py-2 px-4 border border-blue-500 hover:border-transparent rounded"
const inputClass = "border rounded w-full py-2 px-3 mt-1 text-gray-700"

const PixelSelect_: React.FC<Props> = (props) => {
  const { account, login } = useLogin()
  
  const { pixelMap, area, closeSelect, mint, upload } = props
  console.log('PixelSelect render', area)

  pixelMap.areaInParent

  const [mintable, uploadable] = useMemo(() => pixelMap.isMintUploadable(account.addr, area), [account, area, pixelMap])

  const domint = useCallback(async () => {
    closeSelect()
    const pixels = pixelMap.scene.getPixelIndexesFromArea(area)
    const err = await mint(pixels)
    if (!err) {
      // update map
      pixelMap.updatePixelsOwnerArea(area, account.addr)
      pixelMap.hightlightOwnedPixels(account.addr)
    }
  }, [pixelMap, area, account, mint, closeSelect])

  const [imageUrl, setImageUrl] = useState('')
  const [meta] = useState<ImageMeta>({ title: '', subtitle: '', link: '' })

  const chooseImage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event && event.currentTarget && event.currentTarget.files && event.currentTarget.files[0]) {
      const file = event.currentTarget.files[0]
      const src = URL.createObjectURL(file)
      const image = new Image()
      image.src = src
      image.onload = () => pixelMap.setSelectingImage(image)
      setImageUrl(src)
    }
  }, [pixelMap])

  const save = useCallback(async () => {
    closeSelect()

    const areaInParent = pixelMap.areaInParent
    // in case submap (areaInParent available), need to calculate pixel and subpixel 
    const [pixel, subpixel] = areaInParent ? 
      getSubPixel(areaInParent, area.x, area.y) : [pixelMap.scene.getPixelIndex(area.x, area.y), undefined]

    const error = await upload(imageUrl, pixel, area.w, area.h, meta, subpixel)

    if (error) {
      return
    }

    const image: PixelImage = {
      area,
      imageUrl,
      title: meta.title,
      subtitle: meta.subtitle,
      link: meta.link,
    }

    pixelMap.addImage(image)
  }, [area, imageUrl, meta, pixelMap, closeSelect])

  return (
    <>
      <span className='close-select' onClick={closeSelect}><FaXmark size={12} /></span>
        ({area.x}, {area.y}) {area.w} x {area.h}<br/>
        Total {area.w * area.h} pixels selected<br/>
        {account ? (
          <>
            {mintable && <button className={buttonClass} onClick={domint}>mint</button>}
            <input id="chooseImage" hidden type="file" onChange={chooseImage} />
            {uploadable && <label typeof='button' htmlFor="chooseImage" className={`${buttonClass}`}>image</label>}
            {imageUrl && <div>
              <input className={inputClass} onChange={(e) => meta.title = e.target.value} /> <br/>
              <textarea className={inputClass} onChange={(e) => meta.subtitle = e.target.value} /><br/>
              <input className={inputClass} onChange={(e) => meta.link = e.target.value} /><br/>
              <button className={buttonClass} onClick={save}>save</button>
              <button className={buttonClass} onClick={closeSelect}>cancel</button>
            </div>}
          </>
        ) : (
          <button className={buttonClass} onClick={() => login('Polkadot.js')}>
            login
          </button>
        )}
    </>
  )
}

export const PixelSelect = React.memo(PixelSelect_)
