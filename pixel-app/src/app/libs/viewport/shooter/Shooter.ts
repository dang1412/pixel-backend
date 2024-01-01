import { Container } from 'pixi.js'

import { PixelMap } from '../PixelMap'
import { AnimatedSprite } from './AnimatedSprite'
import { characterStates } from './constants'

export class Shooter {

  container = new Container()
  keysPressed: { [key: string]: boolean } = {}
  speed = 0.06
  weapon: 'knife' | 'gun' | 'riffle' | 'bat' = 'riffle'
  gender = 'man'

  constructor(public map: PixelMap, public x: number, public y: number) {
    this.init()
  }

  init() {
    const engine = this.map.engine
    const scene = this.map.scene
    const container = this.container
    scene.getMainContainer().addChild(container)

    const char = new AnimatedSprite(characterStates)

    container.addChild(char.sprite)
    scene.setImagePosition(container, this.x, this.y, 1, 1)

    char.sprite.anchor.set(0.5, 0.5)
    char.sprite.angle = -30
    // char.animationSpeed = 0.1
    char.play()

    // mouse move
    // const pixeSize = scene.options.pixelSize
    engine.on('mousemove', (ex: number, ey: number, px: number, py: number, cx: number, cy: number) => {
      // const x1 = this.x * pixeSize
      // const y1 = this.y * pixeSize
      const [x1, y1] = scene.getCanvasXY(this.x, this.y)
      const angle = Math.atan2(cy - y1, cx - x1) - Math.PI / 2
      char.sprite.rotation = angle
      // console.log('angle', x1, y1, cx, cy, angle)
    })

    // key pressed
    document.addEventListener('keydown', (e) => {
      this.keysPressed[e.key] = true
      // if (e.key === 'f') {
      //   char.switch('hit_knife')
      // }
      if (e.key === '1') {
        this.weapon = 'knife'
      } else if (e.key === '2') {
        this.weapon = 'gun'
      } else if (e.key === '3') {
        this.weapon = 'riffle'
      } else if (e.key === '4') {
        this.weapon = 'bat'
      }
    })
    document.addEventListener('keyup', (e) => {
      this.keysPressed[e.key] = false
    })

    engine.addTick(() => {
      let moving = false
      if (this.keysPressed['a']) {
        this.x -= this.speed
        moving = true
      }
      if (this.keysPressed['w']) {
        this.y -= this.speed
        moving = true
      }
      if (this.keysPressed['s']) {
        this.y += this.speed
        moving = true
      }
      if (this.keysPressed['d']) {
        this.x += this.speed
        moving = true
      }

      let hitting = this.keysPressed['f']
      if (hitting) {
        char.switchOnce(`man-hit-${this.weapon}`, 0.04)
      } else if (moving) {
        char.switch(`man-walk-${this.weapon}`)
      } else {
        char.switch(`man-idle-${this.weapon}`)
      }

      if (moving) this.updatePos()

    })
  }

  updatePos() {
    const scene = this.map.scene
    scene.setImagePosition(this.container, this.x, this.y)
  }
}