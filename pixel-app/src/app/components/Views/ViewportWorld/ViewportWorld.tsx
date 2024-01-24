import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FaArrowPointer, FaHand, FaMaximize } from 'react-icons/fa6'

import Spinner from '@/layouts/Spinner'
import { EngineViewport, OnClickFunc, OnMouseMoveFunc, OnSelectFunc, PixelArea, PixelPoint } from '@/libs/viewport'
import { FloatDialog } from '../FloatDialog'

import './ViewportWorld.css'

interface Props {
  pixelSize?: number
  worldWidthPixel?: number
  worldHeightPixel?: number
  onInit?: (engine: EngineViewport) => void
  onPixelClick?: OnClickFunc
  getDisplayFloat?: (area: PixelArea, closeSelect: () => void, mode?: 0 | 1 | 2) => JSX.Element
  allowToggleMode?: boolean
  customViewTools?: JSX.Element
  firstSceneNoGrid?: boolean
}

const getSetPixelFunc: (x: number, y: number, w: number, h: number) => (cur: PixelArea) => PixelArea = (x: number, y: number, w: number, h: number) => {
  return (current: PixelArea) => {
    if (current.x === x && current.y === y && current.w === w && current.h === h) {
      return current
    }

    return {x, y, w, h}
  }
}

export const ViewportWorld: React.FC<Props> = (props) => {
  const {
    pixelSize = 20, worldHeightPixel = 30, worldWidthPixel = 30,
    onInit, onPixelClick,
    getDisplayFloat,
    allowToggleMode = true,
    customViewTools = <></>,
    firstSceneNoGrid = false,
  } = props
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<EngineViewport>()

  // dialog position following mouse
  const [mouseXY, setMouseXY] = useState<PixelPoint>({ x: 0, y: 0 })
  // selecting area
  const [selectingArea, setSelectingArea] = useState<PixelArea>({ x: 0, y: 0, w: 0, h: 0 })

  // fullscreen
  const [isFullScreen, setIsFullScreen] = useState(false)

  // drag or select mode
  const [isDragMode, setIsDragMode] = useState(true)

  const isSelecting = selectingArea.w > 0

  // mouse move event
  const onMouseMove: OnMouseMoveFunc = useCallback((x, y, px, py) => {
    if (isSelecting) return
    setMouseXY({ x: x + 30, y: y + 20 })
    setSelectingArea(getSetPixelFunc(px, py, 0, 0))
  }, [isSelecting])

  // select event
  const onSelect: OnSelectFunc = useCallback((x, y, px1, py1, px2, py2) => {
    setMouseXY({ x: x + 30, y: y + 20 })
    if (engineRef.current?.dragOrSelectMode === 1) {
      // select mode
      setSelectingArea(getSetPixelFunc(px1, py1, px2 - px1 + 1, py2 - py1 + 1))
    } else {
      // control mode
      setSelectingArea(getSetPixelFunc(px2, py2, 0, 0))
    }
  }, [])

  // click event
  const onClick: OnClickFunc = useCallback((px, py, mx, my) => {
    if (onPixelClick) {
      onPixelClick(px, py, mx, my)
    }
  }, [onPixelClick])

  // Init engine
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = pixelSize * worldWidthPixel
    const height = pixelSize * worldHeightPixel

    console.log('init')
    const engine = engineRef.current = new EngineViewport(canvas, {
      width,
      height,
      minPixelSize: pixelSize
    })
    const mainSceneIndex = engine.createScene(worldWidthPixel, worldHeightPixel, firstSceneNoGrid)
    engine.switchScene(mainSceneIndex)

    // output engine
    if (onInit) {
      onInit(engine)
    }

    // fullscreen handler
    const fullscreenchangeHandler = (e: Event) => {
      const wrapper = e.target as HTMLElement

      const isFull = !!document.fullscreenElement
      setIsFullScreen(isFull)

      if (isFull) {
        setTimeout(() => {
          const { width, height } = wrapper.getBoundingClientRect()
          console.log(width, height)
          engine.resize(width, height - 27)
        }, 100)
      } else {
        engine.resize()
      }
    }

    document.addEventListener('fullscreenchange', fullscreenchangeHandler)

    return () => {
      document.removeEventListener('fullscreenchange', fullscreenchangeHandler)
    }
  }, [pixelSize, worldWidthPixel, worldHeightPixel, onInit])

  // update engine event handlers
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.on('mousemove', onMouseMove)
      engineRef.current.on('select', onSelect)
      engineRef.current.on('click', onClick)
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.removeListener('mousemove', onMouseMove)
        engineRef.current.removeListener('select', onSelect)
        engineRef.current.removeListener('click', onClick)
      }
    }
  }, [onMouseMove, onSelect, onClick])

  // go fullscreen
  const toggleFullscreen = useCallback(() => {
    const wrapper = wrapperRef.current
    if (wrapper) {
      if (!isFullScreen) {
        wrapper.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    }
  }, [isFullScreen])

  // toggle drag/select mode
  const toggleMode = useCallback(() => {
    setIsDragMode(mode => !mode)
  }, [])

  useEffect(() => {
    const engine = engineRef.current
    if (engine) {
      engine.setDragOrSelectMode(isDragMode ? 0 : 1)
    }
  }, [isDragMode])

  const closeSelect = useCallback(() => {
    const engine = engineRef.current
    if (engine) {
      engine.clearSelect()
      setSelectingArea(cur => ({x: cur.x, y: cur.y, w: 0, h: 0}))
    }
  }, [])

  return (
    <div id='WrapFullscreen' className={isFullScreen ? 'fullscreen' : ''} ref={wrapperRef}>
      {getDisplayFloat && <FloatDialog top={mouseXY.y + window.scrollY} left={mouseXY.x}>
        {getDisplayFloat(selectingArea, closeSelect)}
      </FloatDialog>}
      <div className='view-tools'>
        <button onClick={toggleFullscreen} title='Toggle fullscreen mode'><FaMaximize /></button>
        {allowToggleMode && <button onClick={toggleMode} title='Toggle drag/select mode'>{isDragMode ? <FaArrowPointer /> : <FaHand />}</button>}
        {customViewTools}
      </div>
      <canvas ref={canvasRef} style={{border: '1px solid #ccc'}} />
      <Spinner/>
    </div>
  )
}