import { AnimatedSprite, Assets, AssetsManifest, Container, Sprite, Spritesheet, Texture } from 'pixi.js'

import { PixelMap } from '../PixelMap'
import { Shooter } from './Shooter'

// Manifest Example
const manifest: AssetsManifest = {
  bundles: [
    {
      name: 'man-idle-knife',
      assets: [
        {
          alias: 'man_idle_knife_0',
          src: '/shooter/Idle_knife/Idle_knife_000.png',
        },
        {
          alias: 'man_idle_knife_1',
          src: '/shooter/Idle_knife/Idle_knife_001.png',
        },
        {
          alias: 'man_idle_knife_2',
          src: '/shooter/Idle_knife/Idle_knife_002.png',
        },
        {
          alias: 'man_idle_knife_3',
          src: '/shooter/Idle_knife/Idle_knife_003.png',
        },
        {
          alias: 'man_idle_knife_4',
          src: '/shooter/Idle_knife/Idle_knife_004.png',
        },
        {
          alias: 'man_idle_knife_5',
          src: '/shooter/Idle_knife/Idle_knife_005.png',
        },
        {
          alias: 'man_idle_knife_6',
          src: '/shooter/Idle_knife/Idle_knife_006.png',
        },
        {
          alias: 'man_idle_knife_7',
          src: '/shooter/Idle_knife/Idle_knife_007.png',
        },
      ]
    },
    {
      name: 'man-walk-knife',
      assets: [
        {
          alias: 'man_walk_knife_0',
          src: '/shooter/Walk_knife/Walk_knife_000.png',
        },
        {
          alias: 'man_walk_knife_1',
          src: '/shooter/Walk_knife/Walk_knife_001.png',
        },
        {
          alias: 'man_walk_knife_2',
          src: '/shooter/Walk_knife/Walk_knife_002.png',
        },
        {
          alias: 'man_walk_knife_3',
          src: '/shooter/Walk_knife/Walk_knife_003.png',
        },
        {
          alias: 'man_walk_knife_4',
          src: '/shooter/Walk_knife/Walk_knife_004.png',
        },
        {
          alias: 'man_walk_knife_5',
          src: '/shooter/Walk_knife/Walk_knife_005.png',
        },
      ],
    },
  ]
}

export class PixelShooter {
  constructor(public map: PixelMap) {
    map.engine.alwaysRender = true
    this.load()
  }

  private async load() {
    Assets.init({ manifest })
    await Assets.loadBundle('man-idle-knife')
    await Assets.loadBundle('man-walk-knife')

    // await Assets.load<Spritesheet>('/sho*}{_oter/Walk_knife/walk_knife.json')

    // this.addChar()
    new Shooter(this.map, 50, 50)
  }

  addChar() {
    const engine = this.map.engine
    const scene = this.map.scene
    const container = new Container()
    scene.getMainContainer().addChild(container)

    // const char = new Sprite(Texture.from('Walk_knife_000.png'))
    // container.addChild(char)
    // scene.setImagePosition(container, 50, 50, 2, 2)


    // let count = 0
    // const tick = () => {
    //   // char.texture = Texture.from(`man_walk_knife_${count}`)
    //   char.texture = Texture.from(`Walk_knife_00${count}.png`)
    //   count = (count + 1) % 6
    // }

    // let tickCount = 0
    // engine.addTick(() => {
    //   if (tickCount === 0) {
    //     tick()
    //   }
    //   tickCount = (tickCount + 1) % 10
    // })

    // const animations = Assets.cache.get('/shooter/Walk_knife/walk_knife.json').data.animations
    // console.log('animations', animations)
    const char = AnimatedSprite.fromFrames([
      'man_walk_knife_0',
      'man_walk_knife_1',
      'man_walk_knife_2',
      'man_walk_knife_3',
      'man_walk_knife_4',
      'man_walk_knife_5',
    ])
    container.addChild(char)
    scene.setImagePosition(container, 50, 50, 2, 2)

    char.animationSpeed = 1/8
    char.play()
  }
}