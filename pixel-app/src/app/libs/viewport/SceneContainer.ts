import { Renderer, Sprite, Texture, BaseTexture, Container, TilingSprite } from 'pixi.js'
import { Viewport } from 'pixi-viewport'

import { drawViewportGrid, getCanvasXY, getPixelIndex, getPixelIndexesFromArea, getPixelXYFromIndex, getViewportCoord } from './utils'
import { PixelArea } from './types'

export interface SceneViewportOpts {
  pixelSize: number
  worldWidthPixel: number
  worldHeightPixel: number
  noGrid?: boolean
  // viewWidth: number
  // viewHeight: number
}

type PixelSpriteMap = {[index: number]: Sprite}

export class SceneContainer {

  /**
   * Private attributes
   */

  // wrapper container contains grid and main container
  private wrapperContainer: Container
  // main container that includes all layers's container
  private mainContainer: Container
  // selecting
  private selectingSprite: Sprite | null = null
  // each layer has 1 container
  private layerContainerMap: {[layer: string]: Container} = {}
  // each layer has 1 map pixel number => Sprite
  private layerPixelSpriteMap: {[layer: string]: PixelSpriteMap} = {}

  // store the last state
  private lastx = 0
  private lasty = 0
  private lastzoom = 0

  private bgContainer: Container

  /**
   * Constructor
   * @param renderer 
   * @param options 
   */
  constructor(public viewport: Viewport, public options: SceneViewportOpts) {
    const { pixelSize, worldWidthPixel, worldHeightPixel, noGrid = false } = options

    // wrapper
    this.wrapperContainer = new Container()
    // add background layer first
    this.bgContainer = new Container()
    // main, this is included in mini-map
    this.mainContainer = new Container()

    this.wrapperContainer.addChild(this.bgContainer)
    this.wrapperContainer.addChild(this.mainContainer)
    
    viewport.addChild(this.wrapperContainer)

    if (!noGrid) drawViewportGrid(this.wrapperContainer, pixelSize, worldWidthPixel, worldHeightPixel)
  }

  moveToArea(area: PixelArea) {
    const x = (area.x + area.w/2) * this.options.pixelSize
    const y = (area.y + area.h/2) * this.options.pixelSize
    this.viewport.animate({
      position: {x, y},
      scale: 3
    })
  }

  getMainContainer(): Container {
    return this.mainContainer
  }

  hide() {
    this.wrapperContainer.visible = false
    this.lastzoom = this.viewport.scaled
    this.lastx = this.viewport.x
    this.lasty = this.viewport.y
  }

  open() {
    const {pixelSize, worldWidthPixel, worldHeightPixel} = this.options
    const worldWidth = pixelSize * worldWidthPixel
    const worldHeight = pixelSize * worldHeightPixel
    this.viewport.worldWidth = worldWidth
    this.viewport.worldHeight = worldHeight

    if (this.lastzoom) {
      this.viewport.setZoom(this.lastzoom)
      this.viewport.x = this.lastx
      this.viewport.y = this.lasty
    } else {
      this.viewport.fitWorld()
      this.viewport.moveCenter(worldWidth / 2, worldHeight / 2)
    }

    this.wrapperContainer.visible = true
  }

  /**
   * Select on the scene
   * @param x1 
   * @param y1 
   * @param x2 
   * @param y2 
   */
  select(x1: number, y1: number, x2: number, y2: number): [number, number, number, number] {
    const [px1, py1] = this.getViewportCoord(x1, y1)
    const [px2, py2] = this.getViewportCoord(x2, y2)

    const x = Math.min(px1, px2)
    const y = Math.min(py1, py2)

    const w = Math.abs(px2 - px1) + 1
    const h = Math.abs(py2 - py1) + 1
    this.selectArea({x, y, w, h})

    return [x, y, x + w - 1, y + h - 1]
  }

  selectArea(area: PixelArea) {
    const rect = this.getSelectingSprite()
    const { pixelSize } = this.options
    rect.position.set(area.x * pixelSize, area.y * pixelSize)
    rect.width = area.w * pixelSize
    rect.height = area.h * pixelSize

    this.viewport.dirty = true
  }

  private getSelectingSprite(): Sprite {
    if (!this.selectingSprite) {
      const rect = this.selectingSprite = new Sprite(Texture.WHITE)
      rect.tint = 0xa3c6ff
      rect.alpha = 0.4
      this.wrapperContainer.addChild(rect)
    }

    return this.selectingSprite
  }

  clearSelect(): void {
    if (this.selectingSprite) {
      console.log('clearSelect')
      this.selectingSprite.texture = Texture.WHITE
      this.selectingSprite.alpha = 0.4
      this.selectingSprite.width = 0
      this.selectingSprite.height = 0
      this.viewport.dirty = true
    }
  }

  getTotalPixel(): number {
    const { worldWidthPixel, worldHeightPixel } = this.options
    return worldWidthPixel * worldHeightPixel
  }

  getViewportCoord(x: number, y: number): [number, number] {
    const { pixelSize, worldWidthPixel, worldHeightPixel } = this.options
    const [px, py] = getViewportCoord(this.viewport, pixelSize, worldWidthPixel, worldHeightPixel, x, y)

    return [px, py]
  }

  getCanvasXY(px: number, py: number): [number, number] {
    const { pixelSize } = this.options
    const [cx, cy] = getCanvasXY(this.viewport, pixelSize, px, py)

    return [cx, cy]
  }

  getPixelIndex(x: number, y: number): number {
    return getPixelIndex(x, y, this.options.worldWidthPixel)
  }

  getPixelXYFromIndex(index: number): [number, number] {
    return getPixelXYFromIndex(index, this.options.worldWidthPixel)
  }

  getPixelIndexesFromArea(area: PixelArea): number[] {
    return getPixelIndexesFromArea(area, this.options.worldWidthPixel)
  }

  setImagePosition(image: Container, x: number, y: number, w = 0, h = 0) {
    const pixelSize = this.options.pixelSize
    image.position.set(pixelSize * x, pixelSize * y)
    if (w) image.width = w * pixelSize
    if (h) image.height = h * pixelSize
    this.viewport.dirty = true
  }

  /**
   * Add image to an area using url
   * @param area 
   * @param imageURL 
   * @param layer 
   * @returns 
   */
  async addImageURL(area: PixelArea, imageURL: string, layer = 'image') : Promise<Sprite>{
    const texture = imageURL ? await Texture.fromURL(imageURL) : Texture.EMPTY
    return this.addLayerAreaTexture(area, texture, layer)
  }

  setTileBg(tileUrl: string, scale = 1) {
    const texture = Texture.from(tileUrl)
    const w = this.options.worldWidthPixel * this.options.pixelSize * scale
    const h = this.options.worldHeightPixel * this.options.pixelSize * scale
    // this.addLayerAreaTexture({x: 0, y: 0, w, h}, texture, 'background')
    const tilingSprite = new TilingSprite(texture, w, h)
    tilingSprite.scale.set(1/scale, 1/scale)
    tilingSprite.alpha = 0.9
    // const container = this.getLayerContainer('background')
    this.bgContainer.addChild(tilingSprite)
  }

  /**
   * Add image to an area using HTMLImageElement
   * @param area 
   * @param img 
   * @param layer 
   * @returns 
   */
  addImageElement(area: PixelArea, img: HTMLImageElement, layer = 'image'): Sprite {
    const texture = new Texture(new BaseTexture(img))
    return this.addLayerAreaTexture(area, texture, layer)
  }

  /**
   * Get layer's container, init the layer the first time
   * @param layer 
   * @returns 
   */
  getLayerContainer(layer = ''): Container {
    // init layer's {pixel => Sprite} map
    if (!this.layerPixelSpriteMap[layer]) {
      this.layerPixelSpriteMap[layer] = {}
    }

    // init layer's container
    if (!this.layerContainerMap[layer]) {
      this.layerContainerMap[layer] = new Container()
      this.mainContainer.addChild(this.layerContainerMap[layer])
    }

    // return the layer's container
    return this.layerContainerMap[layer]
  }

  /**
   * Get layer's pixel (Sprite) at x, y. Init the pixel the first time
   * @param x 
   * @param y 
   * @param layer 
   * @returns 
   */
  public getLayerPixel(x: number, y: number, layer = ''): Sprite {
    const index = getPixelIndex(x, y, this.options.worldWidthPixel)

    return this.getLayerPixelFromIndex(index, layer)
  }

  /**
   * 
   * @param index 
   * @param layer 
   * @returns 
   */
  public getLayerPixelFromIndex(index: number, layer = ''): Sprite {
    const container = this.getLayerContainer(layer)
    const pixelSpriteMap = this.layerPixelSpriteMap[layer]

    if (!pixelSpriteMap[index]) {
      // init the new pixel, size 1x1
      const pixel = new Sprite(Texture.WHITE)
      pixel.width = pixel.height = this.options.pixelSize
      const [x, y] = this.getPixelXYFromIndex(index)
      pixel.position.set(x * this.options.pixelSize, y * this.options.pixelSize)

      // add to map
      pixelSpriteMap[index] = pixel
      // draw
      container.addChild(pixel)
    }

    // return the pixel
    return pixelSpriteMap[index]
  }

  /**
   * Expands the pixel to an area size w * h
   * @param area 
   * @param texture 
   * @param layer 
   * @returns 
   */
  addLayerAreaTexture(area: PixelArea, texture: Texture = Texture.WHITE, layer = ''): Sprite {
    const { x, y, w, h } = area

    const pixel = this.getLayerPixel(x, y, layer)
    pixel.texture = texture
    pixel.width = w * this.options.pixelSize
    pixel.height = h * this.options.pixelSize
    pixel.tint = 0xffffff

    this.viewport.dirty = true

    return pixel
  }

  /**
   * 
   * @param img 
   * @returns 
   */
  setSelectingImage(img: HTMLImageElement, alpha = 0.8) {
    if (!this.selectingSprite) { return }

    this.selectingSprite.texture = new Texture(new BaseTexture(img))
    this.selectingSprite.alpha = alpha

    this.viewport.dirty = true
  }

  /**
   * 
   * @param img 
   * @returns 
   */
  async setSelectingImageTexture(img: Texture, alpha = 0.8) {
    if (!this.selectingSprite) { return }

    this.selectingSprite.texture = img
    this.selectingSprite.alpha = alpha

    this.viewport.dirty = true
  }

  setSelectingAnchor(x: number, y: number) {
    const sprite = this.getSelectingSprite()
    sprite.anchor.set(x, y)
  }
}
