import { Container, Graphics, Sprite, Texture } from 'pixi.js'
import { sound } from '@pixi/sound'

import { PixelPoint } from '../types'
import { EngineViewport } from '../EngineViewport'
import { PixelAdventure } from '.'
import { itemWearImages } from './constants'

export interface CharacterOptions {
  id: number
  name?: string
  size?: number
  range?: number
  // isEnemy?: boolean
  // hp?: number
}

export class PixelCharacter {
  // character draw
  container = new Container()
  rangeDraw = new Graphics()
  characterDraw = new Sprite()
  hpDraw = new Graphics()
  equipDraw = new Sprite()

  // 
  id: number
  type: number
  name: string
  size: number
  range: number
  equippingItem = 0

  //
  hp = 0

  selecting = false

  //
  // alive = true
  controlMode = 0

  constructor(public adv: PixelAdventure, public x: number, public y: number, options: CharacterOptions, imageUrl = '/images/ghost.png') {
    this.id = options.id
    this.type = Math.floor(this.id / 1000000)
    this.name = options.name || `pixelpuppy-${options.id}`
    this.size = options.size || 1
    this.range = options.range || 2

    this.setup(imageUrl)
  }

  async setup(imageUrl: string) {
    const scene = this.adv.map.scene
    scene.getMainContainer().addChild(this.container)
    scene.setSelectingAnchor(0.5, 0.5)

    // draw range
    let circle = this.rangeDraw
    this.container.addChild(circle)
    this.drawRange()

    // draw beast
    const beast = this.characterDraw
    this.container.addChild(beast)
    this.drawBeast(imageUrl)

    // draw equip
    const equipDraw = this.equipDraw
    this.container.addChild(equipDraw)

    // draw HP
    let bar = this.hpDraw
    this.container.addChild(bar)

    // container position
    scene.setImagePosition(this.container, this.x, this.y)

    // events
    this.container.interactive = true
    this.container.on('mouseover', () => {
      circle.visible = true
      scene.viewport.dirty = true
    })

    this.container.on('mouseout', () => {
      if (this.selecting) return
      circle.visible = false
      scene.viewport.dirty = true
    })
  }

  startControl() {
    const engine = this.adv.map.engine
    const scene = this.adv.map.scene
    const beast = this.characterDraw
    const pixelSize = scene.options.pixelSize

    // set engine mode 2 (control mode)
    engine.setDragOrSelectMode(2)
    // inform this is last controlled beast
    this.adv.setControlBeast(this)
    this.selecting = true
    this.rangeDraw.visible = true

    // selecting on control mode, mark the current pixel only
    let lastx = -1, lasty = -1
    const controlling = async (ex: number, ey: number, px: number, py: number) => {
      // console.log(lastx, lasty, px, py)
      if (lastx === px && lasty === py) return

      lastx = px
      lasty = py
      if (this.isInRange(px, py)) {
        const mode = this.controlMode
        scene.setSelectingImageTexture(mode === 0 ? beast.texture : Texture.from('energy'), 0.4)
        scene.selectArea({ x: px + 0.5, y: py + 0.5, w: mode === 0 ? beast.width / pixelSize : 1, h: mode === 0 ? beast.height / pixelSize : 1 })
      } else {
        scene.clearSelect()
      }
    }
    engine.on('mousemove', controlling)

    engine.once('controlend', (px: number, py: number) => {
      // back to drag mode
      engine.setDragOrSelectMode(0)
      this.selecting = false
      this.rangeDraw.visible = false

      engine.removeListener('mousemove', controlling)

      // check in range
      if (this.isInRange(px, py)) {
        // output control
        const pixel = this.adv.map.scene.getPixelIndex(px, py)
        this.adv.outputCtrl(this.controlMode === 0 ? 0 : 1, this.id, pixel)
      }
    })
  }

  async drawBeast(imageUrl: string) {
    const texture = Texture.from(imageUrl)
    const character = this.characterDraw
    character.texture = texture

    const pixelSize = this.adv.map.scene.options.pixelSize
    const size = pixelSize * (this.type >= 8 ? 3 : this.size)

    // check if venom type 8
    // const ratio = this.type === 8 ? 6 : Math.min(character.width / pixelSize, character.height / pixelSize)
    const ratio = Math.min(character.width / size, character.height / size)
    character.height = character.height / ratio
    character.width = character.width / ratio
    
    character.anchor.set(0.5, 0.5)
    character.x = character.y = pixelSize / 2
  }

  drawHp(hp: number) {
    this.hp = hp
    const bar = this.hpDraw
    bar.clear()
    bar.beginFill(this.hp === 3 ? 'green' : this.hp === 2 ? 'yellow' : 'red')
    bar.drawRect(0, 0- 5, this.adv.map.scene.options.pixelSize * this.hp / 3, 3)
    bar.endFill()
  }

  drawRange() {
    const pixelSize = this.adv.map.scene.options.pixelSize
    let circle = this.rangeDraw
    circle.clear()
    circle.beginFill(0x00FF00)  // Color of the circle (red in this example)
    circle.drawCircle(pixelSize / 2, pixelSize / 2, pixelSize * (this.range + .5))  // x, y, radius
    circle.endFill()
    circle.alpha = 0.12
    circle.visible = false
  }

  async drawEquip(id: number) {
    // not change equip
    if (this.equippingItem === id) return

    this.equippingItem = id
    const equipDraw = this.equipDraw
    if (id === 0) {
      // item off
      equipDraw.texture = Texture.EMPTY
      // range become default
      this.range = 4
      this.drawRange()
      return
    }

    // equips item 1, 2 or 3
    const pixelSize = this.adv.map.scene.options.pixelSize

    const image = itemWearImages[id]
    equipDraw.texture = image ? Texture.from(image) : Texture.EMPTY
    equipDraw.width = pixelSize * 1.5
    equipDraw.height = pixelSize * 1.5
    equipDraw.x = equipDraw.y = pixelSize / 2
    equipDraw.anchor.set(0.5, 0.5)
    
    this.range = 5

    if (id === 3) {
      equipDraw.y = pixelSize * 4/5
      this.range = 8
    }

    // venom
    if (this.type === 8 && (id === 1 || id === 2)) {
      equipDraw.width = pixelSize * 4
      equipDraw.height = pixelSize * 3.5
    }

    this.drawRange()
  }

  isInRange(x: number, y: number): boolean {
    if (this.x === x && this.y === y) return false

    return Math.abs(x - this.x) <= this.range && Math.abs(y - this.y) <= this.range
  }

  async move(tx: number, ty: number, type = 0): Promise<void> {
    const engine = this.adv.map.engine
    sound.play('move', {volume: 0.5})
    engine.viewport.dirty = true
    // const curTexture = this.characterDraw.texture
    // if (this.type === 7) {
    //   this.characterDraw.texture = Texture.from('saitama-move')
    // }
    await move(engine, this.container, {x: this.x, y: this.y}, {x: tx, y: ty})
    this.x = tx
    this.y = ty
  }

  private createEnergy(pixelSize: number, type = 0): [Sprite, number, number, Promise<void>] {
    const energy = new Sprite(Texture.from(type ? 'strike_24.png' : 'energy'))
    energy.width = energy.height = pixelSize

    let dx = 0, dy = 0
    let animatePromise = Promise.resolve()

    if (type) {
      energy.width = energy.height = pixelSize * 3
      // energy.anchor.set(0.5, 0.5)
      animatePromise = this.adv.textureAnimate.animateSprite(energy, 24, 'strike_', 2)
      dx = -1
      dy = -1
    }

    return [energy, dx, dy, animatePromise]
  }

  async shoot(tx: number, ty: number, type = 0): Promise<void> {

    const engine = this.adv.map.engine
    const scene = this.adv.map.scene
    const pixelSize = scene.options.pixelSize

    const [energy, dx, dy, animatePromise] = this.createEnergy(pixelSize, type)

    // shoot sound
    sound.play('shoot', {volume: 0.4})

    scene.getMainContainer().addChild(energy)
    scene.setImagePosition(energy, this.x + dx, this.y + dy)
    const movePromise = move(engine, energy, { x: this.x + dx, y: this.y + dy }, {x: tx + dx, y: ty + dy})

    const curTexture = this.characterDraw.texture
    if (this.type === 7) {
      this.characterDraw.texture = Texture.from('saitama-move')
    } else if (this.type === 8) {
      this.characterDraw.texture = Texture.from('venom-fight')
    }
    await Promise.all([movePromise])
    this.characterDraw.texture = curTexture

    scene.getMainContainer().removeChild(energy)

    if (type === 1) {
      this.adv.textureAnimate.animate({x: tx + 0.5, y: ty - 0.7, w: 5, h: 5}, 27, 'explo1_')
      sound.play('explode1', {volume: 0.4})
    } else if (type === 2) {
      this.adv.textureAnimate.animate({x: tx, y: ty, w: 5, h: 5}, 48, 'flame_')
      sound.play('explode2', {volume: 0.4})
    } else if (type === 3) {
      this.adv.textureAnimate.animate({ x: tx + 0.5, y: ty - 1, w: 9, h: 9 }, 30, 'smash_', 2)
      sound.play('explode2', {volume: 0.4})
    }
  }

  // actRandom() {
  //   const shootormove = randomRange(0, 2) as 0 | 1
  //   const x = this.x +randomRange(-this.range, this.range + 1)
  //   const y = this.y +randomRange(-this.range, this.range + 1)
  //   if (x === this.x && y === this.y) return
  //   this.adv.map.registerAction(this, x, y, shootormove)
  // }

  dead() {
    sound.add('die', '/sounds/char-die.mp3')
    sound.play('die', {volume: 0.4})
    this.adv.map.scene.getMainContainer().removeChild(this.container)
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
