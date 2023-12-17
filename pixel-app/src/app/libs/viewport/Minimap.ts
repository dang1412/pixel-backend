import { Container, Graphics, RenderTexture, Sprite } from 'pixi.js'
import { PixelArea } from './types'

export class Minimap {
  private renderTexture: RenderTexture
  private mapSprite: Sprite
  private viewBorder: Graphics
  private worldBorder: Graphics

  constructor(container: Container) {
    const renderTexture = this.renderTexture = RenderTexture.create({ width: 1000, height: 1000 })
    const mapSprite = this.mapSprite = new Sprite(renderTexture)

    const worldBorder = this.worldBorder = new Graphics()
    const viewBorder = this.viewBorder = new Graphics()

    container.addChild(worldBorder)
    container.addChild(mapSprite)
    container.addChild(viewBorder)
  }

  update(width: number, height: number, viewArea: PixelArea): RenderTexture {
    // update renderTexture size to cover whole map
    this.renderTexture.resize(width, height)
    // update minimap size (min width 180)
    // const ratio = Math.max(0.2, 180 / width)
    const ratio = Math.max(120 / width, 120 / height)
    // const ratio = 150 / width
    this.mapSprite.scale.x = this.mapSprite.scale.y = ratio

    // world border
    this.worldBorder.clear()
    this.worldBorder.beginFill('pink', 0.2)
    this.worldBorder.lineStyle(1, 'pink', 0.5)
      .drawRect(0, 0, width * ratio, height * ratio)
    this.worldBorder.endFill()
    
    // view border
    const { x, y, w, h } = viewArea
    this.viewBorder.clear()
    this.viewBorder.lineStyle(1, 0xCCC)
      .drawRect(x * ratio, y * ratio, w * ratio, h * ratio)

    return this.renderTexture
  }
}