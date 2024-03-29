import { useCallback } from 'react'

import { EngineViewport, PixelArea, PixelImage, PixelMap } from '@/libs/viewport'
import { ViewportWorld } from '../ViewportWorld'

import { mockImages } from '../ViewDisplayDemo/data'
import { PixelShooter } from '@/libs/viewport/shooter'

interface Props {
  onInitGame: (game: PixelShooter) => void
  images?: PixelImage[]
}

export const ViewShooter: React.FC<Props> = (props) => {
  const { onInitGame } = props

  const onInit = useCallback((e: EngineViewport) => {
    const mainMap = new PixelMap(e, 0)
    mainMap.addImages(mockImages)

    const game = new PixelShooter(mainMap)
    onInitGame(game)
  }, [onInitGame])

  // Float Dialog
  const getFloatDialog = useCallback((area: PixelArea, closeSelect: () => void) => {
    return (
      <span>{`(${area.x} ${area.y})`}</span>
    )
  }, [])

  const onPixelClick = useCallback((x: number, y: number, mx: number, my: number) => {
    console.log('click', x, y)
  }, [])

  const dragMan = useCallback((e: React.DragEvent<HTMLImageElement>) => {
    e.dataTransfer.setData('type', `0`)
  }, [])

  const dragZombie = useCallback((e: React.DragEvent<HTMLImageElement>, type: number) => {
    e.dataTransfer.setData('type', `${type}`)
  }, [])

  return (
    <>
      <ViewportWorld
        onInit={onInit}
        onPixelClick={onPixelClick}
        worldHeightPixel={100}
        worldWidthPixel={100}
        pixelSize={30}
        // getDisplayFloat={getFloatDialog}
        allowToggleMode={false}
        firstSceneNoGrid={true}
      />
      <div>
        <img className='inline-block' id={`man-shooter`} src='/pixel_shooter/man_icon_no_bg.png' onDragStart={(e) => dragMan(e)} width="100" height="100" />
        <img className='inline-block' id={`zombie-1-1`} src='/pixel_shooter/zombies/zombie.png' onDragStart={(e) => dragZombie(e, 2)} width="100" height="100" />
        <img className='inline-block' id={`zombie-1-1`} src='/pixel_shooter/zombies/zombie.png' onDragStart={(e) => dragZombie(e, 3)} width="100" height="100" />
        <img className='inline-block' id={`zombie-1-1`} src='/pixel_shooter/zombies/zombie.png' onDragStart={(e) => dragZombie(e, 4)} width="100" height="100" />
        <img className='inline-block' id={`zombie-1-1`} src='/pixel_shooter/zombies/zombie.png' onDragStart={(e) => dragZombie(e, 5)} width="100" height="100" />
      </div>
      <div>
        <p>Click on shooter to control</p>
        <p>A W S D to move, f to fire</p>
        <p>Weapons: 1 - knife, 2 - gun, 3 - riffle, 4 - bat, 5 - flame</p>
      </div>
    </>
  )
}