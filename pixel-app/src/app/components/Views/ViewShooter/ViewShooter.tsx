import { useCallback } from 'react'

import { EngineViewport, PixelArea, PixelImage, PixelMap } from '@/libs/viewport'
import { ViewportWorld } from '../ViewportWorld'

import { mockImages } from '../ViewDisplayDemo/data'
import { PixelShooter } from '@/libs/viewport/shooter'

interface Props {
  images?: PixelImage[]
}

export const ViewShooter: React.FC<Props> = (props) => {
  const onInit = useCallback((e: EngineViewport) => {
    const mainMap = new PixelMap(e, 0)
    mainMap.addImages(mockImages)

    const shooter = new PixelShooter(mainMap)
  }, [])

  // Float Dialog
  const getFloatDialog = useCallback((area: PixelArea, closeSelect: () => void) => {
    return (
      <span>{`(${area.x} ${area.y})`}</span>
    )
  }, [])

  const onPixelClick = useCallback((x: number, y: number, mx: number, my: number) => {
    console.log('click', x, y)
  }, [])

  return (
    <ViewportWorld
      onInit={onInit}
      onPixelClick={onPixelClick}
      worldHeightPixel={100}
      worldWidthPixel={100}
      pixelSize={30}
      getDisplayFloat={getFloatDialog}
      allowToggleMode={false}
    />
  )
}