import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FaTurnUp, FaXmark } from 'react-icons/fa6'
import { sound } from '@pixi/sound'

import { EngineViewport, PixelArea, PixelMap } from '@/libs/viewport'
import { ViewportWorld } from '../ViewportWorld'
import { PixelOver } from '../PixelOver'

import { mockImages } from '../ViewDisplayDemo/data'
import { outsidePickMap, pixelInsidePickmap, totalReward } from './data'
import { useLogin } from '@/components/hooks/useLogin'

interface PixelSelectProps {
  area: PixelArea
  map: PixelMap
  pick: (areaInParent: PixelArea, area: PixelArea) => Promise<string>
  closeSelect: () => void
}

function isSameArea(a1: PixelArea, a2: PixelArea): boolean {
  return a1.x === a2.x && a1.y === a2.y && a1.w === a2.w && a1.h === a2.h
}

// const user = 'Tung'

const _PixelSelect: React.FC<PixelSelectProps> = (props) => {
  const { account, login } = useLogin()
  const { area, map, pick, closeSelect } = props

  const dopick = useCallback(async () => {
    if (!map.areaInParent) return

    const err = await pick(map.areaInParent, area)

    if (err) return

    map.pick(account.addr, area)
    map.highlightUserPicked(account.addr)
    closeSelect()
  }, [area, map, closeSelect])

  const pickable = useMemo(() => map.isPickable(account.addr, area), [area, map])

  return (
    <div>
      <span className='close-select' onClick={closeSelect}><FaXmark size={12} /></span>
      ({area.x}, {area.y}) {area.w} x {area.h}<br/>
      Total {area.w * area.h} pixels selected<br/>
      {pickable && <button onClick={dopick}>Pick</button>}
    </div>
  )
} 

const PixelSelect = React.memo(_PixelSelect, (prev, next) => {
  return isSameArea(prev.area, next.area) && prev.map === next.map
})

interface Props {
  pixelPickedNumber: [number, number][]
  pick: (areaInParent: PixelArea, area: PixelArea) => Promise<string>
  loadPickedArea: (area: PixelArea) => Promise<[number, number][]>
}

export const ViewLotteryGame: React.FC<Props> = (props) => {
  const {
    pick,
    pixelPickedNumber,
    loadPickedArea,
  } = props
  const [pixelMap, setPixelMap] = useState<PixelMap>()
  const [reward, setReward] = useState(0)

  // got the engine with main map
  const onInit = useCallback((e: EngineViewport) => {
    const mainMap = new PixelMap(e, 0, { lotteryMode: true })
    mainMap.addImages(mockImages)
    mainMap.open()

    // mock picks
    // mainMap.pixelPickNumberMap = new Map(pixelPickedNumber)
    // mainMap.highlightUserPicked('')
    mainMap.totalReward = totalReward

    setPixelMap(mainMap)

    // sound.add('bg-sound', '/sounds/fluffing-a-duck-bg-sound.mp3')
    // sound.play('bg-sound', {loop: true, volume: 0.5})
  }, [])

  useEffect(() => {
    if (pixelMap && !pixelMap.parentMap && pixelMap.pixelPickNumberMap.size === 0) {
      // only main map
      pixelMap.pixelPickNumberMap = new Map(pixelPickedNumber)
      pixelMap.highlightUserPicked('')
    }
    
  }, [pixelMap, pixelPickedNumber])

  useEffect(() => {
    return () => {
      sound.stopAll()
    }
  }, [])

  // update total reward
  useEffect(() => {
    if (pixelMap) {
      const pmap = pixelMap.parentMap ? pixelMap.parentMap : pixelMap
      setReward(pmap.totalReward)
    }
  }, [pixelMap])

  // Handle pixel click event
  const onPixelClick = useCallback(async (x: number, y: number) => {
    if (!pixelMap) return
    console.log('openPixel', x, y)
    const nextMap = await pixelMap.openPixel(x, y)
    if (nextMap) {
      // mock pick
      // if (nextMap.areaInParent) {
      //   const { x, y } = nextMap.areaInParent
      //   const pixel = pixelMap.scene.getPixelIndex(x, y)
      //   const mockPickMap = pixelInsidePickmap.get(pixel)
      //   if (nextMap.pixelPickNumberMap.size === 0 && mockPickMap) {
      //     nextMap.pixelPickNumberMap = mockPickMap
      //     nextMap.highlightUserPicked('')
      //   }
      // }

      if (nextMap.areaInParent && nextMap.pixelPickNumberMap.size === 0) {
        const pickedCount = await loadPickedArea(nextMap.areaInParent)
        nextMap.pixelPickNumberMap = new Map(pickedCount)
        nextMap.highlightUserPicked('')
      }

      // update pixel map
      setPixelMap(nextMap)
    }
  }, [pixelMap])

  const goParentMap = useCallback(() => {
    const parentMap = pixelMap?.goParentMap()
    if (parentMap) {
      setPixelMap(parentMap)
    }
  }, [pixelMap])

  // Float Dialog
  const getFloatDialog = useCallback((area: PixelArea, closeSelect: () => void) => {
    if (!pixelMap) return <></>

    return area.w ? (
      <PixelSelect
        area={area}
        map={pixelMap}
        closeSelect={closeSelect}
        pick={pick}
      />
      ): (
      <PixelOver x={area.x} y={area.y} map={pixelMap}/>
    )
  }, [pixelMap])

  return (
    <ViewportWorld
      onInit={onInit}
      onPixelClick={onPixelClick}
      customViewTools={
        <>
          {pixelMap && pixelMap.parentMap && <button onClick={goParentMap} title='Go up'><FaTurnUp /></button>}
          &nbsp;Total Reward: {reward}$
        </>
      }
      getDisplayFloat={getFloatDialog}
      worldWidthPixel={100}
      worldHeightPixel={100}
      pixelSize={20}
    />
  )
}
