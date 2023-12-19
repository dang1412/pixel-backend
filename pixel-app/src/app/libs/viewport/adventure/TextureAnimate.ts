import { Sprite, Texture } from 'pixi.js'

import { EngineViewport } from '../EngineViewport'
import { PixelArea } from '../types'

export class TextureAnimate {

  constructor(public engine: EngineViewport) {}

  async animate(area: PixelArea, frameCount: number, prefix = '') {
    const scene = this.engine.getCurrentScene()
    if (!scene) return

    const sprite = new Sprite()
    scene.getMainContainer().addChild(sprite)
    scene.setImagePosition(sprite, area.x, area.y, area.w, area.h)

    // const sprite = scene.addLayerAreaTexture(area, Texture.WHITE, 'animate')
    sprite.anchor.set(0.5, 0.5)

    await this.animateSprite(sprite, frameCount, prefix)

    scene.getMainContainer().removeChild(sprite)
  }

  async animateSprite(sprite: Sprite, frameCount: number, prefix = ''): Promise<void> {
    const engine = this.engine
    const scene = engine.getCurrentScene()
    if (!scene) return

    // await Assets.load<Spritesheet>(sheetUrl)
    // const curTexture = sprite.texture

    return new Promise((res) => {
      let count = 0
      const tick = (dt: number) => {
        if (count % 3 === 0) {
          
          const frameNum = count / 3
          const frameStr = (frameNum < 10 ? `0` : '') + `${frameNum}`
          
          console.log('Render animation', frameNum)
          // update to next frame
          const t = Texture.from(`${prefix}${frameStr}.png`)
          sprite.texture = t
          
          if (frameNum === frameCount) {
            // stop animation
            // sprite.texture = curTexture
            engine.removeTick(tick)
            res()
          }
        }
        
        count ++
        scene.viewport.dirty = true
      }
      
      engine.addTick(tick)
      // kick-off animation
      scene.viewport.dirty = true
    })
  }
}