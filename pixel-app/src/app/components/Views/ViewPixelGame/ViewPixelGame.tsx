import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FaXmark, FaAngleRight, FaGun, FaPersonWalking, FaTurnUp } from 'react-icons/fa6'
// import { Sound } from 'pixi.js'

import { EngineViewport, PixelArea, PixelGameMap, PixelImage, PixelMap } from '@/libs/viewport'
import { ViewportWorld } from '../ViewportWorld'
import { GamePixelOver } from '../GamePixelOver'

import { images } from './data'
import { TimeCounting } from './TimeCounting'
import { sound } from '@pixi/sound'

interface PixelControlProps {
  x: number
  y: number
  game: PixelGameMap
  closeSelect: () => void
}

const PixelControl: React.FC<PixelControlProps> = ({x, y, game, closeSelect}) => {
  const char = game.selectingCharacter

  const move = () => {
    if (char) {
      game.registerAction(char, x, y, 0)
    }
    closeSelect()
  }

  const shoot = () => {
    if (char) {
      game.registerAction(char, x, y, 1)
    }
    closeSelect()
  }

//   <button class="flex items-center bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue active:bg-blue-700">
//     <i class="fas fa-play mr-2"></i> Play
// </button>

{/* <button type="button" class="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
          <span class="absolute -inset-1.5"></span>
          <span class="sr-only">View notifications</span>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button> */}

  return (
    <>
      <span className='close-select' onClick={closeSelect}><FaXmark size={12} /></span>
      ({x}, {y}) Move or Shoot<br/>
      <button
        type='button'
        className="relative text-lg rounded bg-gray-400 p-1 mx-1 text-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
        onClick={move}
      >
        <FaPersonWalking />
      </button>
      <button
        className="relative text-lg rounded bg-gray-400 p-1 text-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
        onClick={shoot}
      >
        <FaGun />
      </button>
    </>
  )
}

interface Props {}

export const ViewPixelGame: React.FC<Props> = (props) => {
  // const gameRef = useRef<PixelGameMap>()
  const [gameMap, setGameMap] = useState<PixelGameMap>()

  // got the engine with main map
  const onInit = useCallback((e: EngineViewport) => {
    const mainMap = new PixelMap(e, 0)
    mainMap.addImages(images)

    const pixelGame = new PixelGameMap(mainMap)

    pixelGame.addCharacter(21, 15, { name: 'Player1', range: 3 }, '/images/axie.png')
    pixelGame.addCharacter(15, 17, { name: 'Player2', range: 3 }, '/images/axi2.png')
    pixelGame.addCharacter(23, 22, { name: 'Bot', range: 3, isEnemy: true })  // enemy
    pixelGame.addCharacter(14, 15, { name: 'Bot', range: 3, isEnemy: true })  // enemy
    pixelGame.addCharacter(11, 18, { name: 'Bot', range: 3, isEnemy: true })  // enemy
    pixelGame.addCharacter(24, 18, { name: 'Bot', range: 3, isEnemy: true })  // enemy
    pixelGame.addCharacter(18, 13, { name: 'Bot', range: 3, isEnemy: true })  // enemy
    pixelGame.addCharacter(16, 21, { name: 'Bot', range: 3, isEnemy: true })  // enemy
    pixelGame.addCharacter(29, 12, { name: 'Bot', range: 3, isEnemy: true })  // enemy

    // gameRef.current = pixelGame
    setGameMap(pixelGame)

    sound.add('bg-sound', '/sounds/fluffing-a-duck-bg-sound.mp3')
    sound.play('bg-sound', {loop: true, volume: 0.5})
  }, [])

  useEffect(() => {
    return () => {
      sound.stop('bg-sound')
    }
  }, [])

  // Float Dialog
  const getFloatDialog = useCallback((area: PixelArea, closeSelect: () => void) => {
    // const game = gameRef.current
    if (!gameMap) return <></>

    return area.w ? (
        <PixelControl x={area.x} y={area.y} game={gameMap} closeSelect={closeSelect} />
      ): (
        <GamePixelOver x={area.x} y={area.y} game={gameMap}/>
      )
  }, [gameMap])

  // Handle pixel click event
  const onPixelClick = useCallback((x: number, y: number, mx: number, my: number) => {
    // const game = gameRef.current
    if (!gameMap) return <></>

    const inRange = gameMap.isInRange(x, y)
    if (inRange) {
      gameMap.map.engine.selectArea(mx, my, { x, y, w: 1, h: 1 })
    } else {
      const char = gameMap.handleSelect(x, y)
      if (!char) {
        // try open if on image
        (async () => {
          const subgamemap = await gameMap.openPixel(x, y)
          if (subgamemap) {
            // open success
            setGameMap(subgamemap)
          }
        })()
      }
    }

  }, [gameMap])

  // execute
  const goNextTurn = useCallback(() => {
    // const game = gameRef.current
    if (!gameMap) return

    gameMap.execute()
  }, [gameMap])

  // go parent
  const goParentMap = useCallback(() => {
    const parentMap = gameMap?.goParentMap()
    if (parentMap) {
      setGameMap(parentMap)
    }
  }, [gameMap])

  return (
    <div>
      <ViewportWorld
        onInit={onInit}
        onPixelClick={onPixelClick}
        worldHeightPixel={40}
        worldWidthPixel={40}
        pixelSize={40}
        getDisplayFloat={getFloatDialog}
        allowToggleMode={false}
        customViewTools={<>
          <TimeCounting interval={4} onTimeEnd={goNextTurn} />
          <button onClick={goNextTurn} title='Skip to next turn'><FaAngleRight /></button>
          {gameMap && gameMap.parentGameMap && <button onClick={goParentMap} title='Go main map'><FaTurnUp /></button>}
        </>}
      />
    </div>
  )
}
