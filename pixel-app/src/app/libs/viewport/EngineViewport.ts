import { Container, Renderer } from 'pixi.js'

import { SceneContainer } from './SceneContainer'
import { Viewport } from 'pixi-viewport'
import { PixelArea } from './types'
import { Minimap } from './Minimap'

export type OnMouseMoveFunc = (mx: number, my: number, px: number, py: number) => void
export type OnSelectFunc = (mx: number, my: number, px1: number, py1: number, px2: number, py2: number) => void
export type OnClickFunc = (px: number, py: number, mx: number, my: number) => void
export type OnControlFunc = (px1: number, py1: number, px2: number, py2: number, scene?: SceneContainer) => void

export interface GameEngineOpts {
  width: number
  height: number
  minPixelSize?: number
}

export class EngineViewport {
  // viewport
  public viewport: Viewport

  private renderer: Renderer
  private scenes: SceneContainer[] = []
  public activeSceneIndex = -1

  // 0: drag, 1: select, 2: control
  dragOrSelectMode: 0 | 1 | 2 = 0

  // minimap
  private miniMap: Minimap

  // wrapper contains MiniMap and Viewport
  private wrapper: Container

  //
  private ticks: Function[] = []

  //
  private screenWidth: number
  private screenHeight: number

  //
  private minPixelSize: number

  // event listeners
  private handlersMap: Map<string, Function[]> = new Map()

  //
  alwaysRender = false

  on(event: string, handler: Function) {
    const funcs = this.handlersMap.get(event) || []
    funcs.push(handler)

    this.handlersMap.set(event, funcs)
  }

  removeListener(event: string, handler: Function) {
    const funcs = this.handlersMap.get(event) || []
    const ind = funcs.findIndex(f => f === handler)
    funcs.splice(ind, 1)

    this.handlersMap.set(event, funcs)
  }

  once(event: string, handler: Function) {
    const _handler = (...args: any[]) => {
      handler(...args)
      this.removeListener(event, _handler)
    }
    this.on(event, _handler)
  }

  emit(event: string, ...args: any[]) {
    const funcs = this.handlersMap.get(event) || []

    for (const func of funcs) {
      func(...args)
    }
  }

  constructor(canvas: HTMLCanvasElement, public options: GameEngineOpts) {
    this.screenWidth = Math.min(760, options.width, document.body.clientWidth * 0.9)
    this.screenHeight = Math.min(760, options.height, document.body.clientHeight * 0.85)
    this.minPixelSize = options.minPixelSize || 20

    const renderer = this.renderer = new Renderer({
      width: this.screenWidth,
      height: this.screenHeight,
      antialias: true,
      view: canvas,
      backgroundColor: 0xffffff
    })

    const viewport = this.viewport = new Viewport({
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight,
      worldWidth: options.width,    // update when open scene
      worldHeight: options.height,  // update when open scene
      passiveWheel: false,
      // interaction: renderer.plugins.interaction
      events: renderer.events,
      // stopPropagation: true,
      threshold: 10
    })

    viewport
      .drag()
      .pinch()
      .decelerate({
        friction: 0.95
      })
      .wheel()
      .clamp({direction: 'all'})
      .clampZoom({minScale: 1})

    this.wrapper = new Container()
    this.wrapper.addChild(viewport)

    // this._setupKey()
    this.setupMouseEvents()
    this.runUpdate()

    // create miniMap
    const mapContainer = new Container()
    mapContainer.position.set(10, 10)
    this.wrapper.addChild(mapContainer)

    this.miniMap = new Minimap(mapContainer)

    // events listener
    this.viewport.on('moved', () => this.updateMinimap())
    this.viewport.on('zoomed', () => this.updateMinimap())
  }

  addTick(tick: (dt: number) => void) {
    this.ticks.push(tick)
  }

  removeTick(tick: (dt: number) => void) {
    const i = this.ticks.findIndex((func) => func === tick)
    this.ticks.splice(i, 1)
  }

  clearSelect(): void {
    const scene = this.getCurrentScene()
    if (scene) {
      scene.clearSelect()
    }
  }

  setDragOrSelectMode(mode: 0 | 1 | 2) {
    this.dragOrSelectMode = mode
    this.updateViewportDragMode()
  }

  resize(w = this.screenWidth, h = this.screenHeight) {
    const scene = this.getCurrentScene()
    if (scene) {
      this.renderer.resize(w, h)
      // this.options.width = w
      // this.options.height = h
      const curH = scene.viewport.screenHeight
      const curScale = scene.viewport.scaled
      scene.viewport.resize(w, h)
      scene.viewport.setZoom(curScale * h / curH)
      this.updateMinimap()
    }
  }

  getRenderer(): Renderer {
    return this.renderer
  }

  createScene(worldWidthPixel: number, worldHeightPixel: number, noGrid = false): number {
    const screenWidth = this.screenWidth
    const screenHeight = this.screenHeight
    // make it fit but not smaller than minPixelSize
    const pixelSize = Math.max(screenWidth / worldWidthPixel, screenHeight / worldHeightPixel, this.minPixelSize)
    const scene = new SceneContainer(this.viewport, {pixelSize, worldWidthPixel, worldHeightPixel, noGrid})
    return this.addScene(scene)
  }

  addScene(scene: SceneContainer): number {
    const index = this.scenes.length
    this.scenes.push(scene)

    return index
  }

  switchScene(index: number) {
    if (index === this.activeSceneIndex) { return }

    // deactivate old scene
    this.deactivateScene()

    this.activeSceneIndex = index
    this.updateViewportDragMode()
    
    // activate
    this.activateScene()
  }

  deactivateScene() {
    const scene = this.getCurrentScene()
    if (scene) {
      console.log('deactivateScene', this.activeSceneIndex)
      scene.clearSelect()
      scene.hide()
      // scene.viewport.pause = true
      // scene.viewport.eventMode = 'none'
      // scene.viewport.dispatchEvent('')
    }
  }

  activateScene() {
    const scene = this.getCurrentScene()
    if (scene) {
      console.log('activateScene', this.activeSceneIndex)
      scene.open()
      this.updateMinimap()
      // first render
      scene.viewport.dirty = true
      // scene.viewport.pause = false
      // scene.viewport.eventMode = 'static'
      // ;(scene.viewport as any).sceneIndex = this.activeSceneIndex
    }
  }

  updateMinimap() {
    const scene = this.getCurrentScene()
    if (scene) {
      const { top, left, worldScreenWidth, worldScreenHeight, worldWidth: width, worldHeight: height } = this.viewport
      const viewArea: PixelArea = { x: left, y: top, w: worldScreenWidth, h: worldScreenHeight }
      // resize the renderTexture, redraw minimap
      const renderTexture = this.miniMap.update(width, height, viewArea)
      // render minimap
      // console.log('render minimap')
      // TODO render too much?
      const mainContainer = scene.getMainContainer()
      this.renderer.render(mainContainer, { renderTexture })
    }
  }

  getCurrentScene(): SceneContainer | null {
    return this.scenes[this.activeSceneIndex]
  }

  getSceneContainer(i: number): SceneContainer | null {
    return this.scenes[i]
  }

  selectArea(mx: number, my: number, area: PixelArea) {
    const scene = this.getCurrentScene()
    if (!scene) { return }

    const { x, y, w, h } = area
    this.emit('select', mx, my, x, y, x + w - 1, y + h - 1)
  }

  private updateViewportDragMode() {
    const scene = this.getCurrentScene()
    if (scene) {
      if (this.dragOrSelectMode === 0) {
        scene.viewport.plugins.resume('drag')
      } else {
        scene.viewport.plugins.pause('drag')
      }
    }
  }

  private runUpdate() {
    if (this.alwaysRender || this.viewport.dirty) {
      // render wrapper includes minimap and viewport
      // console.log('render ticks length', this.ticks.length)
      this.renderer.render(this.wrapper)
      this.viewport.dirty = false
      for (const tick of this.ticks) {
        tick(10)
      }
    }

    requestAnimationFrame(() => this.runUpdate())
    // setTimeout(() => this.runUpdate(), 40)
  }

  private setupMouseEvents() {
    console.log('setupMouseEvents')
    const canvas = this.renderer.view as HTMLCanvasElement

    let selecting = false
    let [startX, startY] = [0 ,0]
    // let [startPx, startPy] = [0, 0]

    const getXY = (e: {x: number, y: number}) => {
      const x = e.x - canvas.offsetLeft
      const y = e.y - canvas.offsetTop + (document.fullscreenElement ? 0 : window.scrollY)
      return [x, y]
    }

    const onSelect = (ex: number, ey: number, startX: number, startY: number, endX: number, endY: number) => {
      const scene = this.getCurrentScene()
      if (!scene) { return }

      if (this.dragOrSelectMode === 1) {
        // select mode
        const [px1, py1, px2, py2] = scene.select(startX, startY, endX, endY)
        this.emit('select', ex, ey, px1, py1, px2, py2)
      } else if (this.dragOrSelectMode === 2) {
        // control mode
        // const [px, py] = scene.getViewportCoord(endX, endY)
        // this.emit('controlling', ex, ey, px, py)
      }
    }

    const onMove = (ex: number, ey: number, cx: number, cy: number) => {
      const scene = this.getCurrentScene()
      if (scene) {
        const [px, py] = scene.getViewportCoord(cx, cy)
        this.emit('mousemove', ex, ey, px, py, cx, cy)
      }
    }

    // used to check in click event, mouse should not move too far to fire 'click'
    let downx: number, downy: number, upx: number, upy: number
    const start = (e: {x: number, y: number}) => {
      const scene = this.getCurrentScene()
      if (!scene) { return }
      downx = e.x
      downy = e.y
      ;[startX, startY] = getXY(e)
      const [px, py] = scene.getViewportCoord(startX, startY)
      this.emit('startselect', e.x, e.y, px, py)
      if (this.dragOrSelectMode === 1) {
        selecting = true
        console.log('startselect')
      }
    }

    const end = (e: { x: number, y: number }) => {
      const scene = this.getCurrentScene()
      if (!scene) return

      upx = e.x
      upy = e.y
      // if (!selecting) { return }
      selecting = false
      
      if (this.dragOrSelectMode === 2) {
        const [x, y] = getXY(e)
        const [px, py] = scene.getViewportCoord(x, y)
        this.emit('controlend', px, py)
      }
    }

    const move = (e: { x: number, y: number }) => {
      const [x, y] = getXY(e)
      if (selecting) {
        onSelect(e.x, e.y, startX, startY, x, y)
      } else {
        onMove(e.x, e.y, x, y)
      }
    }

    canvas.addEventListener('mousedown', start)
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) return
      const t = e.touches[0]
      start({x: t.clientX, y: t.clientY})
    })

    canvas.addEventListener('mousemove', move)
    let lastTouchX = 0, lastTouchY = 0
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) return
      const t = e.touches[0]
      lastTouchX = t.clientX
      lastTouchY = t.clientY - 30
      move({ x: lastTouchX, y: lastTouchY })
    })

    canvas.addEventListener('mouseup', end)
    canvas.addEventListener('touchend', () => {
      end({x: lastTouchX, y: lastTouchY})
    })

    // allow drop on canvas
    canvas.addEventListener('dragover', (e) => e.preventDefault())
    canvas.addEventListener('drop', (e) => {
      const scene = this.getCurrentScene()
      if (!scene) return

      const [x, y] = getXY(e)
      const [px, py] = scene.getViewportCoord(x, y)
      this.emit('drop', e.dataTransfer, px, py, x, y)

      // const type = e.dataTransfer?.getData('type')
      // console.log('Drop', e.dataTransfer)
      // if (type === 'beast' || type === 'item' || type === 'building') {
      //   // type 'beast', 'item' or 'building'
      //   const id = e.dataTransfer?.getData('id')
      //   console.log(`drop ${type}`, id, px, py)
      //   if (id) {
      //     this.emit(`drop${type}`, Number(id), px, py)
      //   }
      // } else {
      //   this.emit(`drop${type}`, px, py)
      // }
    })

    // prevent click event after dragging
    let wasDragging = false
    this.viewport.on('drag-start', () => {
      wasDragging = true
    })
    this.viewport.on('drag-end', () => {
      setTimeout(() => { wasDragging = false }, 100)
    })

    // click
    const handleClick = (e: {x: number, y: number}) => {
      setTimeout(() => {
        const change = Math.abs(upx - downx) + Math.abs(upy - downy)
        if (change > 5) return
        
        const scene = this.getCurrentScene()
        // if (scene && this.options.onClick) {
        if (scene) {
          const [x, y] = getXY(e)
          const [px, py] = scene.getViewportCoord(x, y)
          // this.options.onClick(px, py, e.x, e.y)
          this.emit('click', px, py, e.x, e.y)
        }
      }, 50)
    }
    this.viewport.on('pointerup', handleClick)
  }
}