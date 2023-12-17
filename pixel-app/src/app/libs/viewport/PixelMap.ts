import { Sprite } from 'pixi.js'

import { EngineViewport } from './EngineViewport'
import { PixelArea, PixelImage, PixelInfo } from './types'
import { SceneContainer } from './SceneContainer'
import { PIXEL_EXPAND_X, PIXEL_EXPAND_Y } from './constants'

export interface PixelMapOptions {
  lotteryMode?: boolean
}

export class PixelMap {
  scene: SceneContainer
  //
  pixelToImageMap: Map<number, PixelImage> = new Map()
  //
  pixelToSubMap: Map<number, PixelMap> = new Map()
  //
  pixelToOwnerMap: Map<number, string> = new Map()

  //
  parentMap?: PixelMap

  //
  owner?: string

  //
  areaInParent?: PixelArea

  //
  lotteryMode: boolean

  constructor(public engine: EngineViewport, public sceneIndex: number, opts: PixelMapOptions = {}) {
    // check scene exist
    const scene = this.engine.getSceneContainer(sceneIndex)
    if (!scene) {
      throw new Error(`Scene index ${sceneIndex} not exist in engine`)
    }

    this.scene = scene
    this.lotteryMode = opts.lotteryMode || false

    // draw winning cup
    if (this.lotteryMode) {
      this.scene.addImageURL({x: 0, y: 0, w: 1, h: 1}, '/images/trophy.gif', 'PRIZE')
    }
  }

  getImage(x: number, y: number): PixelImage | null {
    const pixelIndex = this.scene.getPixelIndex(x, y)
    return this.pixelToImageMap.get(pixelIndex) || null
  }

  async addImages(images: PixelImage[]): Promise<void> {
    // add images layer
    this.scene.getLayerContainer('images')
    for (const image of images) {
      await this.addImage(image)
      const owner = this.getPixelOwner(image.area.x, image.area.y)
      if (owner) this.updatePixelsOwnerArea(image.area, owner)
    }
    this.engine.updateMinimap()
  }

  async addImage(image: PixelImage): Promise<Sprite> {
    // get scene
    const scene = this.scene

    // update pixelToImageMap
    const indexes = scene.getPixelIndexesFromArea(image.area)
    for (const index of indexes) {
      this.pixelToImageMap.set(index, image)
    }

    // add image to the scene
    console.log('addImage', image.area, image.imageUrl, 'images')
    const imageSprite = await scene.addImageURL(image.area, image.imageUrl, 'images')
    imageSprite.alpha = 0.9

    return imageSprite
  }

  async openPixel(x: number, y: number): Promise<PixelMap | null> {
    // For now this function only for root map
    if (this.sceneIndex > 0) return null

    const scene = this.scene

    const pixelIndex = scene.getPixelIndex(x, y)

    // check if this submap exist
    let submap = this.pixelToSubMap.get(pixelIndex)
    if (!submap) {
      // if no submap, check the image
      const image = this.pixelToImageMap.get(pixelIndex)
      if (!image && !this.lotteryMode) return null

      const area = image ? image.area : {x, y, w: 1, h: 1}

      // create submap from image
      // submap scene
      const width = area.w * PIXEL_EXPAND_X
      const height = area.h * PIXEL_EXPAND_Y
      const submapSceneIndex = this.engine.createScene(width, height)
      submap = new PixelMap(this.engine, submapSceneIndex, { lotteryMode: this.lotteryMode })
      submap.parentMap = this
      submap.areaInParent = area

      const owner = this.pixelToOwnerMap.get(pixelIndex)
      if (owner) {
        submap.owner = owner
      }

      // update pixel => submap
      const indexes = scene.getPixelIndexesFromArea(area)
      for (const index of indexes) {
        this.pixelToSubMap.set(index, submap)
      }

      // if click on image
      if (image) {
        // background image
        // const subscene = this.engine.getSceneContainer(submapSceneIndex)
        // if (subscene) {
        //   const bg = await subscene.addImageURL({ x: 0, y: 0, w: width, h: height }, image.imageUrl, 'background')
        //   bg.alpha = 0.15
        // }
        await submap.setBgImage(image.imageUrl)
  
        // add images to submap
        await submap.addImages(image.subImages || [])
      }
    }

    submap.open()

    return submap
  }

  async setBgImage(imageUrl: string) {
    const { worldWidthPixel: w, worldHeightPixel: h } = this.scene.options
    const bg = await this.scene.addImageURL({ x: 0, y: 0, w, h }, imageUrl, 'background')
    bg.alpha = 0.1
  }

  open() {
    //draw cup
    this.drawWinningCup()
    // siwtch map
    this.engine.switchScene(this.sceneIndex)
  }

  goParentMap(): PixelMap | null {
    if (this.parentMap) {
      this.parentMap.open()
    }

    return this.parentMap || null
  }

  /**
   * 
   * @param pixelIds 
   * @param owner 
   * @returns 
   */
  updatePixelsOwner(pixelIds: number[], owner: string) {
    // update pixelToImageMap
    for (const pixelId of pixelIds) {
      this.pixelToOwnerMap.set(pixelId, owner)
    }
  }

  /**
   * 
   * @param area 
   * @param owner 
   * @returns 
   */
  updatePixelsOwnerArea(area: PixelArea, owner: string) {
    const pixelIds = this.scene.getPixelIndexesFromArea(area)
    this.updatePixelsOwner(pixelIds, owner)
  }

  /**
   * 
   * @param pixels 
   */
  updateMintedPixels(pixels: PixelInfo[]) {
    for (const p of pixels) {
      this.pixelToOwnerMap.set(p.pixelId, p.owner)
    }
  }

  getPixelOwner(x: number, y: number): string | undefined {
    if (this.owner) return this.owner

    const pixelIndex = this.scene.getPixelIndex(x, y)

    return this.getPixelIndexOwner(pixelIndex)
  }

  getPixelIndexOwner(index: number): string | undefined {
    return this.pixelToOwnerMap.get(index)
  }

  /**
   * 
   * @param owner 
   * @returns 
   */
  hightlightOwnedPixels(owner: string) {
    const scene = this.scene

    const allPixels = Array.from(this.pixelToOwnerMap.keys())
    for (const pixelIndex of allPixels) {
      const pixel = scene.getLayerPixelFromIndex(pixelIndex, 'pixel')
      if (this.pixelToOwnerMap.get(pixelIndex) === owner) {
        pixel.tint = 0xdce090
      } else {
        pixel.tint = 0xababab
      }
      pixel.alpha = 0.4
    }

    // update
    scene.viewport.dirty = true
  }

  /**
   * 
   * @param user 
   * @param area 
   * @returns 
   */
  isMintUploadable(user: string, area: PixelArea): [boolean, boolean] {
    // not login
    if (!user) {
      return [false, false]
    }
    // owner of whole map
    if (this.owner === user) {
      return [false, true]
    }

    const scene = this.scene
    
    // no mint in submap
    let mintable = this.parentMap ? false : true
    let uploadable = true

    const indexes = scene.getPixelIndexesFromArea(area)
    for (const index of indexes) {
      const powner = this.pixelToOwnerMap.get(index)
      if (powner) {
        mintable = false
      }
      if (powner !== user) {
        uploadable = false
      }
    }

    return [mintable, uploadable]
  }

  /**
   * 
   * @param img 
   * @returns 
   */
  setSelectingImage(img: HTMLImageElement) {
    this.scene.setSelectingImage(img)
  }

  /**
   * LOTTERY GAME
   */

  pixelPickNumberMap: Map<number, number> = new Map()
  userPickedPixelMap: Map<string, Map<number, boolean>> = new Map()

  // only used in root map
  totalReward = 0
  winningPixel = 505002
  winningPoint = [0, 0]

  isWinningPoint(x: number, y: number): boolean {
    return x === this.winningPoint[0] && y === this.winningPoint[1]
  }

  /**
   * 
   * @param user 
   * @param area 
   */
  pick(user: string, area: PixelArea) {
    const indexes = this.scene.getPixelIndexesFromArea(area)

    // sum of all pixel indexes, used to calculate winning pixel
    let indexesSum = 0

    // update pixelPickNumberMap
    for (const index of indexes) {
      const picked = this.pixelPickNumberMap.get(index) || 0
      this.pixelPickNumberMap.set(index, picked + 1)
      indexesSum += index
    }

    // update userPickedPixelMap
    const userPicked = this.userPickedPixelMap.get(user) || new Map<number, boolean>()
    this.userPickedPixelMap.set(user, userPicked)
    for (const index of indexes) {
      userPicked.set(index, true)
    }

    // update pick in parent
    const parent = this.parentMap
    if (parent) {
      for (const index of indexes) {
        const [cx, cy] = this.scene.getPixelXYFromIndex(index)
        const [x, y] = this.getXYInParent(cx, cy)
        parent.pick(user, {x, y, w: 1, h: 1})
      }

      parent.highlightUserPicked(user)
      parent.updateWinningPixel(indexesSum)
      // update total reward in main map
      parent.totalReward += area.w * area.h
    }
  }

  // update winning pixel (only root map)
  updateWinningPixel(change: number) {
    // no call in submap
    if (this.parentMap) return

    const numberOfAllPixel = this.scene.getTotalPixel() * PIXEL_EXPAND_X * PIXEL_EXPAND_Y
    this.winningPixel = (this.winningPixel + change) % numberOfAllPixel
  }

  /**
   * 
   * @param user 
   * @param area 
   * @returns 
   */
  isPickable(user: string, area: PixelArea): boolean {
    // only pick in submap
    if (!this.parentMap) return false

    return true
    // const userPicked = this.userPickedPixelMap.get(user)
    // if (!userPicked) return true

    // const indexes = this.scene.getPixelIndexesFromArea(area)
    // for (const index of indexes) {
    //   if (userPicked.get(index)) {
    //     // picked this
    //     return false
    //   }
    // }

    // return true
  }

  highlightUserPicked(user: string) {
    const allPickedPixels = Array.from(this.pixelPickNumberMap.keys())
    const allPickedValues = Array.from(this.pixelPickNumberMap.values())
    const maxValue = Math.max(...allPickedValues)

    const userPicked = this.userPickedPixelMap.get(user) || new Map<number, boolean>()

    // highlight pixels
    for (const index of allPickedPixels) {
      const pixel = this.scene.getLayerPixelFromIndex(index, 'pixel')
      const value = this.pixelPickNumberMap.get(index) || 0

      const owned = userPicked.get(index)

      pixel.tint = owned ? 0x00ff00 : 0xff2020
      pixel.alpha = Math.max(value / maxValue * 0.6, 0.1)
    }

    this.scene.viewport.dirty = true
  }

  /**
   * 
   * @param x 
   * @param y 
   * @returns 
   */
  getPickedNumber(x: number, y: number): number {
    const index = this.scene.getPixelIndex(x, y)
    return this.pixelPickNumberMap.get(index) || 0
  }

  private getXYInParent(x: number, y: number): [number, number] {
    if (!this.areaInParent) return [x, y]

    const { x: startX, y: startY } = this.areaInParent
    const dx = Math.floor(x / PIXEL_EXPAND_X)
    const dy = Math.floor(y / PIXEL_EXPAND_Y)

    return [startX + dx, startY + dy]
  }

  private drawWinningCup() {
    // get cup image
    const cupImage = this.scene.getLayerPixelFromIndex(0, 'PRIZE')

    // display winning pixel
    if (this.parentMap) {
      // submap
      let winningIndexInRoot = Math.floor(this.parentMap.winningPixel / (PIXEL_EXPAND_X * PIXEL_EXPAND_Y))
      const [curX, curY] = this.parentMap.scene.getPixelXYFromIndex(winningIndexInRoot)
      console.log('winning submap: ', winningIndexInRoot, curX, curY)
      if (this.areaInParent) {
        const subIndex = this.parentMap.winningPixel % (PIXEL_EXPAND_X * PIXEL_EXPAND_Y)
        const subx = subIndex % PIXEL_EXPAND_X
        const suby = (subIndex - subx) / PIXEL_EXPAND_X
        const { x: startX, y: startY } = this.areaInParent

        const x = (curX - startX) * PIXEL_EXPAND_X + subx
        const y = (curY - startY) * PIXEL_EXPAND_Y + suby

        this.scene.setImagePosition(cupImage, x, y)
        this.winningPoint = [x, y]
      }
    } else {
      // rootmap
      let winningIndex = Math.floor(this.winningPixel / (PIXEL_EXPAND_X * PIXEL_EXPAND_Y))
      const [x, y] = this.scene.getPixelXYFromIndex(winningIndex)
      console.log('winning: ', this.winningPixel, winningIndex, x, y)
      this.scene.setImagePosition(cupImage, x, y)
      this.winningPoint = [x, y]
    }
  }
}
