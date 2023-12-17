import React, { ChangeEvent, useCallback, useMemo, useState } from 'react'
import { FaTurnUp, FaXmark } from 'react-icons/fa6'

import { EngineViewport, PixelArea, PixelImage, PixelMap } from '@/libs/viewport'
import { ViewportWorld } from '../ViewportWorld'
import { PixelOver } from '../PixelOver'

import { images, minted } from './data'

interface PixelSelectProps {
  area: PixelArea
  map: PixelMap
  close: () => void
  mint: (area: PixelArea) => void
}

function isSameArea(a1: PixelArea, a2: PixelArea): boolean {
  return a1.x === a2.x && a1.y === a2.y && a1.w === a2.w && a1.h === a2.h
}

const user = 'Tung'

/**
 * PixelSelect component
 */
const _PixelSelect: React.FC<PixelSelectProps> = (props) => {
  const { area, map, close, mint } = props

  const mintClick = useCallback(() => {
    mint(area)
    map.updatePixelsOwnerArea(area, user)
    map.hightlightOwnedPixels(user)
    close()
  }, [area, map, close, mint])

  const [mintable, uploadable] = useMemo(() => map.isMintUploadable(user, area), [area, map])

  const [imageUrl, setImageUrl] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubTitle] = useState('')
  const [link, setLink] = useState('')

  const chooseImage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event && event.currentTarget && event.currentTarget.files && event.currentTarget.files[0]) {
      const file = event.currentTarget.files[0]
      const src = URL.createObjectURL(file)
      const image = new Image()
      image.src = src
      map.setSelectingImage(image)
      setImageUrl(src)
    }
  }, [map])

  const save = useCallback(() => {
    const image: PixelImage = {
      area,
      imageUrl,
      title,
      subtitle,
      link
    }

    map.addImage(image)
    close()
  }, [area, imageUrl, title, subtitle, link, map, close])

  return (
    <div>
      <span className='close-select' onClick={close}><FaXmark size={12} /></span>
        ({area.x}, {area.y}) {area.w} x {area.h}<br/>
        Total {area.w * area.h} pixels selected<br/>
      {mintable && <button onClick={mintClick}>mint</button>}
      <input id="chooseImage" hidden type="file" onChange={chooseImage} />
      {uploadable && <label htmlFor="chooseImage" className="custom-button">Image</label>}
      {imageUrl && <div>
          <input onChange={(e) => setTitle(e.target.value)} /> <br/>
          <textarea onChange={(e) => setSubTitle(e.target.value)} /><br/>
          <input onChange={(e) => setLink(e.target.value)} /><br/>
          <button onClick={save}>save</button>
          <button onClick={close}>cancel</button>
        </div>}
    </div>
  )
}

const PixelSelect = React.memo(_PixelSelect, (prev, next) => {
  return isSameArea(prev.area, next.area) && prev.map === next.map
})

interface Props {
  mint: (area: PixelArea) => void
}

/**
 * ViewMintUpload component
 * @param props 
 * @returns 
 */
export const ViewMintUpload: React.FC<Props> = (props) => {
  const { mint } = props
  const [pixelMap, setPixelMap] = useState<PixelMap>()

  // got the engine with main map
  const onInit = useCallback((e: EngineViewport) => {
    const mainMap = new PixelMap(e, 0)
    for (const area of minted) {
      mainMap.updatePixelsOwnerArea(area, 'root')
      mainMap.hightlightOwnedPixels(user)
    }
    mainMap.addImages(images)

    setPixelMap(mainMap)
  }, [])

  // Float Dialog
  const getFloatDialog = useCallback((area: PixelArea, closeSelect: () => void) => {
    if (!pixelMap) return <></>

    return area.w ? (
      <PixelSelect area={area} map={pixelMap} close={closeSelect} mint={mint}/>
      ): (
      <PixelOver x={area.x} y={area.y} map={pixelMap}/>
    )
  }, [pixelMap, mint])

  // Handle pixel click event
  const onPixelClick = useCallback(async (x: number, y: number) => {
    if (!pixelMap) return
    const nextMap = await pixelMap.openPixel(x, y)
    if (nextMap) {
      // update pixel map if open success
      setPixelMap(nextMap)
    }
  }, [pixelMap])

  const goParentMap = useCallback(() => {
    const parentMap = pixelMap?.goParentMap()
    if (parentMap) {
      setPixelMap(parentMap)
    }
  }, [pixelMap])

  return (
    <ViewportWorld
      worldWidthPixel={25}
      worldHeightPixel={25}
      onInit={onInit}
      onPixelClick={onPixelClick}
      customViewTools={
        <>
          {pixelMap && pixelMap.parentMap && <button onClick={goParentMap} title='Go up'><FaTurnUp /></button>}
        </>
      }
      getDisplayFloat={getFloatDialog}
    />
  )
}
