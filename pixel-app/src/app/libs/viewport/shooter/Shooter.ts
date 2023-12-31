import { Container } from 'pixi.js'

import { PixelMap } from '../PixelMap'
import { AnimatedSprite } from './AnimatedSprite'

export class Shooter {

  container = new Container()
  keysPressed: { [key: string]: boolean } = {}
  speed = 0.08

  constructor(public map: PixelMap, public x: number, public y: number) {
    this.init()
  }

  init() {
    const engine = this.map.engine
    const scene = this.map.scene
    const container = this.container
    scene.getMainContainer().addChild(container)

    const char = new AnimatedSprite({
      'idle': [
        'man_idle_knife_0',
        'man_idle_knife_1',
        'man_idle_knife_2',
        'man_idle_knife_3',
        'man_idle_knife_4',
        'man_idle_knife_5',
        'man_idle_knife_6',
        'man_idle_knife_7',
      ],
      'walk': [
        'man_walk_knife_0',
        'man_walk_knife_1',
        'man_walk_knife_2',
        'man_walk_knife_3',
        'man_walk_knife_4',
        'man_walk_knife_5',
      ]
    })
    
    container.addChild(char.sprite)
    scene.setImagePosition(container, this.x, this.y, 1, 1)

    char.sprite.anchor.set(0.5, 0.5)
    char.sprite.angle = -30
    // char.animationSpeed = 0.1
    char.play()

    // mouse move
    const pixeSize = scene.options.pixelSize
    engine.on('mousemove', (ex: number, ey: number, px: number, py: number, cx: number, cy: number) => {
      // const x1 = this.x * pixeSize
      // const y1 = this.y * pixeSize
      const [x1, y1] = scene.getCanvasXY(this.x, this.y)
      const angle = Math.atan2(cy - y1, cx - x1) - Math.PI / 2
      char.sprite.rotation = angle
      console.log('angle', x1, y1, cx, cy, angle)
    })

    // key pressed
    document.addEventListener('keydown', (e) => {
      this.keysPressed[e.key] = true
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
      
      if (moving) {
        char.switch('walk')
        this.updatePos()
      } else {
        char.switch('idle')
      }

    })
  }

  updatePos() {
    const scene = this.map.scene
    scene.setImagePosition(this.container, this.x, this.y)
  }
}