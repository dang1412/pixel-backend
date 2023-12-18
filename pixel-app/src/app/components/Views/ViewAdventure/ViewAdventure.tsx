import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FaGun, FaPersonWalking, FaTurnUp } from 'react-icons/fa6'

import { EngineViewport, PixelAdventure, PixelArea, PixelImage, PixelMap } from '@/libs/viewport'
import { ViewportWorld } from '../ViewportWorld'

import { mockImages } from '../ViewDisplayDemo/data'
// import { TimeCounting } from './TimeCounting'
import { PixelOver } from './PixelOver'

const controlClass = 'relative rounded bg-gray-400 p-1 mx-1 text-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-white'

const beastImages = [
  '/images/axie.png',
  '/images/axie2.png',
  '/images/axie3.png',
  '/images/axie4.png',
  '/images/ghost.png',
  '/images/amu1.png',
  '/images/amu2.png',
]

const itemIds = [1,2]
const itemImages: { [id: number]: string } = {
  1: '/images/bluelight.png',
  2: '/images/aura.png'
}

interface Props {
  images?: PixelImage[]
  onInitAdventure: (adv: PixelAdventure) => void
}

export const ViewAdventure: React.FC<Props> = (props) => {
  const { images = [], onInitAdventure } = props
  const adventureRef = useRef<PixelAdventure>()

  const [isSubmap, setIsSubmap] = useState(false)

  const [moveOrShoot, setMoveOrShoot] = useState(0)

  // update adventure mode
  useEffect(() => {
    const adventure = adventureRef.current
    if (adventure) {
      adventure.controlMode = moveOrShoot
    }
  }, [moveOrShoot])

  // got the engine with main map
  const onInit = useCallback((e: EngineViewport) => {
    const mainMap = new PixelMap(e, 0)
    mainMap.addImages(mockImages)

    const adventure = new PixelAdventure(mainMap)
    onInitAdventure(adventure)

    adventureRef.current = adventure
  }, [])

  // load images
  useEffect(() => {
    const map = adventureRef.current?.map
    if (map) {
      // TODO do this only once
      // only main map
      map.addImages(images)
    }
  }, [images])

  useEffect(() => {
    const keydown = function(event: KeyboardEvent) {
      if(event.key === 'a') {
        setMoveOrShoot(0)
      } else if(event.key === 's') {
        setMoveOrShoot(1)
      }
    }
    document.addEventListener('keydown', keydown)

    return () => {
      // sound.stop('bg-sound')
      document.removeEventListener('keydown', keydown)
    }
  }, [])

  // Float Dialog
  const getFloatDialog = useCallback((area: PixelArea, closeSelect: () => void) => {
    const adventure = adventureRef.current
    if (!adventure) return <></>

    return area.w ? (
        // <PixelControl x={area.x} y={area.y} game={adventure} control={control} closeSelect={closeSelect} />
        <span/>
      ): (
        <PixelOver x={area.x} y={area.y} game={adventure}/>
      )
  }, [])

  // Handle pixel click event
  const onPixelClick = useCallback((x: number, y: number, mx: number, my: number) => {
    const adventure = adventureRef.current
    if (!adventure) return <></>
    (async () => {
      const subgamemap = await adventure.openPixel(x, y)
      if (subgamemap) {
        // open success
        setIsSubmap(true)
      }
    })()
  }, [])

  // go parent
  const goParentMap = useCallback(() => {
    const adventure = adventureRef.current
    const parentMap = adventure?.goParentMap()
    if (parentMap) {
      setIsSubmap(false)
    }
  }, [])

  // const adventure = adventureRef.current
  const dragStart = useCallback((e: React.DragEvent<HTMLImageElement>, t: number) => {
    const id = Math.floor(Math.random() * 1000000) + t * 1000000
    e.dataTransfer.setData('type', `beast`)
    e.dataTransfer.setData('id', `${id}`)
  }, [])

  const dragItem = useCallback((e: React.DragEvent<HTMLImageElement>, id: number) => {
    e.dataTransfer.setData('type', `item`)
    e.dataTransfer.setData('id', `${id}`)
  }, [])

  return (
    <div>
      <ViewportWorld
        onInit={onInit}
        onPixelClick={onPixelClick}
        worldHeightPixel={100}
        worldWidthPixel={100}
        pixelSize={30}
        getDisplayFloat={getFloatDialog}
        allowToggleMode={false}
        customViewTools={<>
          {/* <TimeCounting interval={4} onTimeEnd={goNextTurn} /> */}
          {/* <button onClick={goNextTurn} title='Skip to next turn'><FaAngleRight /></button> */}
          <button
            className={`${controlClass} ${moveOrShoot === 0 ? 'text-white' : ''}`}
            onClick={() => setMoveOrShoot(0)}
            title='Move mode'
          >
            <FaPersonWalking />
          </button>(A)
          <button
            className={`${controlClass} ${moveOrShoot === 1 ? 'text-white' : ''}`}
            onClick={() => setMoveOrShoot(1)}
            title='Shoot mode'
          >
            <FaGun />
          </button>(S)
          {isSubmap && <button onClick={goParentMap} title='Go main map'><FaTurnUp /></button>}
        </>}
      />
      {beastImages.map((img, ind) => <img className='inline-block' key={ind} id={`axie-${ind}`} src={img} onDragStart={(e) => dragStart(e, ind)} width="100" height="100" />)}
      <br/>
      {itemIds.map((id, ind) => <img className='inline-block' key={ind} id={`item-${ind}`} src={itemImages[id]} onDragStart={(e) => dragItem(e, id)} width="60" height="60" />)}
    </div>
  )
}
