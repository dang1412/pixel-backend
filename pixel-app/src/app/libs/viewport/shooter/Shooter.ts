import { Container } from 'pixi.js'

import { PixelMap } from '../PixelMap'
import { AnimatedSprite } from './AnimatedSprite'
import { characterStates } from './constants'
import { CharacterAttrs, CharacterControl } from 'adventure_engine/dist/shooting'

const weapons = ['', 'knife', 'gun', 'riffle', 'bat']

export class Shooter {

  container = new Container()
  keysPressed: { [key: string]: boolean } = {}
  speed = 2
  // weapon: 'knife' | 'gun' | 'riffle' | 'bat' = 'riffle'
  gender = 'man'

  char: AnimatedSprite

  ctrl: CharacterControl

  private lastX = 0
  private lastY = 0

  constructor(public map: PixelMap, public id: number, public attrs: CharacterAttrs) {
    this.char = new AnimatedSprite(characterStates)
    this.ctrl = { id, angle: 0, up: false, down: false, left: false, right: false, fire: false, weapon: 1 }
    this.init()
  }

  init() {
    const engine = this.map.engine
    const scene = this.map.scene
    const container = this.container
    scene.getMainContainer().addChild(container)

    const char = this.char

    container.addChild(char.sprite)
    scene.setImagePosition(container, this.attrs.x / 100, this.attrs.y / 100, 1, 1)

    char.sprite.anchor.set(0.5, 0.5)
    char.play()

    engine.addTick(() => this.updateByCtrl())
  }

  setAngle(targetX: number, targetY: number) {
    const scene = this.map.scene
    const [x1, y1] = scene.getCanvasXY(this.attrs.x / 100, this.attrs.y / 100)
    const angle = Math.atan2(targetY - y1, targetX - x1) + 1.5 * Math.PI
    this.ctrl.angle = Math.round(angle * 100)
    this.char.sprite.rotation = angle
    // console.log('angle', angle)
  }

  private updateByCtrl() {
    let moving = false
    if (this.ctrl.left) {
      this.attrs.x -= this.speed
      moving = true
    }
    if (this.ctrl.up) {
      this.attrs.y -= this.speed
      moving = true
    }
    if (this.ctrl.down) {
      this.attrs.y += this.speed
      moving = true
    }
    if (this.ctrl.right) {
      this.attrs.x += this.speed
      moving = true
    }

    // if (moving) {
      this.updatePos()
    // }

    if (this.ctrl.fire) {
      this.char.switchOnce(`man-hit-${weapons[this.ctrl.weapon]}`, 0.04)
    } else if (moving) {
      this.char.switch(`man-walk-${weapons[this.ctrl.weapon]}`)
    } else {
      this.char.switch(`man-idle-${weapons[this.ctrl.weapon]}`)
    }

    // rotate
    this.char.sprite.rotation = this.ctrl.angle / 100
  }

  private updatePos() {
    if (this.lastX === this.attrs.x && this.lastY === this.attrs.y) return
    this.lastX = this.attrs.x
    this.lastY = this.attrs.y
    const scene = this.map.scene

    console.log('updatePos', this.attrs.x, this.attrs.y)
    scene.setImagePosition(this.container, this.attrs.x / 100, this.attrs.y / 100)
  }
}