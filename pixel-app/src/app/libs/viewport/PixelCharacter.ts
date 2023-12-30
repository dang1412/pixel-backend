import { Container, Graphics, Sprite, Texture } from 'pixi.js'

import { PixelMap } from './PixelMap'
import { SceneContainer } from './SceneContainer'
import { PixelPoint } from './types'
import { EngineViewport } from './EngineViewport'
import { sound } from '@pixi/sound'
import { PixelGameMap } from './PixelGameMap'

// const energyTexture = Texture.fromURL('/images/energy2.png')

export interface CharacterOptions {
  name: string
  size?: number
  range?: number
  isEnemy?: boolean
}

export class PixelCharacter {
  // character draw
  container = new Container()
  rangeDraw = new Graphics()
  character = new Sprite()

  // 
  name: string
  size: number
  range: number
  isEnemy: boolean

  selecting = false

  //
  alive = true

  constructor(public gameMap: PixelGameMap, public x: number, public y: number, options: CharacterOptions, imageUrl = '/images/ghost.png') {
    this.name = options.name
    this.size = options.size || 1
    this.range = options.range || 2
    this.isEnemy = options.isEnemy || false

    this.setup(imageUrl)
  }

  async setup(imageUrl: string) {
    const scene = this.gameMap.map.scene
    scene.getMainContainer().addChild(this.container)
    const pixelSize = scene.options.pixelSize

    // draw circle
    let circle = this.rangeDraw
    circle.beginFill(this.isEnemy ? 0xFF0000 : 0x00FF00)  // Color of the circle (red in this example)
    circle.drawCircle(pixelSize / 2, pixelSize / 2, pixelSize * (this.range + .5))  // x, y, radius
    circle.endFill()
    circle.alpha = 0.12
    circle.visible = false
    this.container.addChild(circle)

    // draw character
    const texture = await Texture.fromURL(imageUrl)
    const character = this.character
    character.texture = texture
    const ratio = character.width / character.height
    character.height = pixelSize
    character.width = pixelSize * ratio
    // character.tint = 0xff0000
    this.container.addChild(character)

    // container position
    scene.setImagePosition(this.container, this.x, this.y)

    // events
    character.interactive = true
    character.on('mouseover', () => {
      circle.visible = true
      scene.viewport.dirty = true
    })

    character.on('mouseout', () => {
      if (this.selecting) return
      circle.visible = false
      scene.viewport.dirty = true
    })
  }

  select(selecting = true) {
    this.selecting = selecting
    this.rangeDraw.visible = selecting
    this.gameMap.map.scene.viewport.dirty = true
  }

  async move(tx: number, ty: number): Promise<void> {
    const engine = this.gameMap.map.engine
    if (!this.isEnemy) {
      sound.add('move', '/sounds/whistle.mp3')
      sound.play('move', {volume: 0.5})
    }
    await move(engine, this.container, {x: this.x, y: this.y}, {x: tx, y: ty})
    this.x = tx
    this.y = ty
  }

  async shoot(tx: number, ty: number): Promise<void> {
    const energy = new Sprite()
    // energy.texture = await energyTexture

    const engine = this.gameMap.map.engine
    const scene = this.gameMap.map.scene
    const pixelSize = scene.options.pixelSize
    energy.width = energy.height = pixelSize

    // shoot sound
    if (!this.isEnemy) {
      sound.add('shoot', '/sounds/sword.mp3')
      sound.play('shoot', {volume: 0.4})
    }

    scene.getMainContainer().addChild(energy)
    scene.setImagePosition(energy, this.x, this.y)
    await move(engine, energy, { x: this.x, y: this.y }, {x: tx, y: ty})
    scene.getMainContainer().removeChild(energy)
  }

  actRandom() {
    const shootormove = randomRange(0, 2) as 0 | 1
    const x = this.x +randomRange(-this.range, this.range + 1)
    const y = this.y +randomRange(-this.range, this.range + 1)
    if (x === this.x && y === this.y) return
    this.gameMap.registerAction(this, x, y, shootormove)
  }

  dead() {
    sound.add('die', '/sounds/char-die.mp3')
    sound.play('die', {volume: 0.4})
    this.gameMap.map.scene.getMainContainer().removeChild(this.container)
  }
}

async function move(engine: EngineViewport, object: Container, from: PixelPoint, to: PixelPoint): Promise<void> {
  return new Promise((resolve) => {

    const scene = engine.getCurrentScene()
    if (!scene) {
      resolve()
      return
    }

    let x = from.x, y = from.y
    const dx = (to.x - from.x) / 25
    const dy = (to.y - from.y) / 25

    const tick = (dt: number) => {
      x += dx
      y += dy
      if (x > to.x === dx > 0) {
        x = to.x
      }
      if (y > to.y === dy > 0) {
        y = to.y
      }

      scene.setImagePosition(object, x, y)
      if (x === to.x && y === to.y) {
        // finish moving
        // untick
        engine.removeTick(tick)
        resolve()
      }
    }
    
    engine.addTick(tick)
  })
}

function randomRange(start: number, stop: number) {
  return Math.floor(Math.random() * (stop - start)) + start; 
}
