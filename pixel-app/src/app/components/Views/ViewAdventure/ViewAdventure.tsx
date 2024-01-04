import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FaGun, FaPersonWalking, FaTurnUp, FaRegHandLizard  } from 'react-icons/fa6'

import { EngineViewport, PixelAdventure, PixelArea, PixelImage, PixelMap } from '@/libs/viewport'
import { ViewportWorld } from '../ViewportWorld'

import { mockImages } from '../ViewDisplayDemo/data'
// import { TimeCounting } from './TimeCounting'
import { PixelOver } from './PixelOver'
import { ALL_IMAGES, beastImageMap, buildingImages, itemImages } from '@/libs/viewport/adventure/constants'

const controlClass = 'rounded bg-gray-400 p-1 mx-1 text-lg text-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-white'

const beastImages = Object.keys(beastImageMap).sort().map(type => beastImageMap[Number(type)]).map(key => ALL_IMAGES[key] || '')
const itemIds = Object.keys(itemImages).map(id => Number(id)).sort()
const buildingIds = Object.keys(buildingImages).map(id => Number(id)).sort()

interface Props {
  images?: PixelImage[]
  onInitAdventure: (adv: PixelAdventure) => void
}

export const ViewAdventure: React.FC<Props> = (props) => {
  const { images = [], onInitAdventure } = props
  const adventureRef = useRef<PixelAdventure>()

  const [isSubmap, setIsSubmap] = useState(false)

  const [moveOrShoot, setMoveOrShoot] = useState(0)
  const [isEquipping, setIsEquipping] = useState(false)

  const [openModal, setOpenModal] = useState(false)

  // update adventure mode
  useEffect(() => {
    const adventure = adventureRef.current
    if (adventure && adventure.lastControlBeast) {
      adventure.lastControlBeast.controlMode = moveOrShoot
    }
  }, [moveOrShoot])

  // got the engine with main map
  const onInit = useCallback((e: EngineViewport) => {
    const mainMap = new PixelMap(e, 0)
    mainMap.addImages(mockImages)

    const adventure = new PixelAdventure(mainMap)
    onInitAdventure(adventure)

    adventureRef.current = adventure

    adventure.onSetControlBeast = (beast) => {
      console.log('control beast', beast)
      setMoveOrShoot(beast.controlMode)
      setIsEquipping(beast.equippingItem > 0)
    }
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
      } else if (adventure.map.parentMap) {
        // click on building on submap
        const image = adventure.map.getImage(x, y)
        if (image && image.title === 'Items Shop') setOpenModal(true)
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
  
  const dragBuilding = useCallback((e: React.DragEvent<HTMLImageElement>, id: number) => {
    e.dataTransfer.setData('type', `building`)
    e.dataTransfer.setData('id', `${id}`)
  }, [])

  const beastDropEquip = useCallback(() => {
    const adventure = adventureRef.current
    if (adventure) {
      adventure.beastDropItem()
    }
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
          </button> (A)
          <button
            className={`${controlClass} ${moveOrShoot === 1 ? 'text-white' : ''}`}
            onClick={() => setMoveOrShoot(1)}
            title='Shoot mode'
          >
            <FaGun />
          </button> (S)
          <button
            hidden={!isEquipping}
            className={`${controlClass}`}
            onClick={beastDropEquip}
            title='Drop Item'
          >
            <FaRegHandLizard />
          </button>
          {isSubmap && <button onClick={goParentMap} title='Go main map'><FaTurnUp /></button>}
          <div hidden={!openModal} className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* <!--
              Background backdrop, show/hide based on modal state.

              Entering: "ease-out duration-300"
                From: "opacity-0"
                To: "opacity-100"
              Leaving: "ease-in duration-200"
                From: "opacity-100"
                To: "opacity-0"
            --> */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                {/* <!--
                  Modal panel, show/hide based on modal state.

                  Entering: "ease-out duration-300"
                    From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    To: "opacity-100 translate-y-0 sm:scale-100"
                  Leaving: "ease-in duration-200"
                    From: "opacity-100 translate-y-0 sm:scale-100"
                    To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                --> */}
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      {/* <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </div> */}
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Monsters</h3>
                        <div className="mt-2">
                          {beastImages.map((img, ind) => <img className='inline-block' key={ind} id={`axie-${ind}`} src={img} width="100" height="100" />)}
                        </div>
                        <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Items</h3>
                        <div className="mt-2">
                          {itemIds.map((id, ind) => <img className='inline-block mr-2' key={ind} id={`item-${ind}`} src={ALL_IMAGES[itemImages[id]]} width="60" height="60" />)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    >
                      Trade
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setOpenModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>}
      />
      {beastImages.map((img, ind) => <img className='inline-block' key={ind} id={`axie-${ind}`} src={img} onDragStart={(e) => dragStart(e, ind)} width="100" height="100" />)}
      <br/>
      {itemIds.map((id, ind) => <img className='inline-block mr-2' key={ind} id={`item-${ind}`} src={ALL_IMAGES[itemImages[id]]} onDragStart={(e) => dragItem(e, id)} width="60" height="60" />)}
      <br/>
      {buildingIds.map((id, ind) => <img className='inline-block mr-2' key={ind} id={`building-${ind}`} src={ALL_IMAGES[buildingImages[id]]} onDragStart={(e) => dragBuilding(e, id)} width="120" height="120" />)}

      

    </div>
  )
}
