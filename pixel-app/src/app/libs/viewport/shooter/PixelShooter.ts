import { AnimatedSprite, Assets, AssetsManifest, Container, Sprite, Spritesheet, Texture } from 'pixi.js'

import { PixelMap } from '../PixelMap'
import { Shooter } from './Shooter'
import { manifest } from './constants'

// Manifest Example
// const manifest: AssetsManifest = {
//   bundles: [
//     {
//       name: 'man-idle-knife',
//       assets: [
//         {
//           alias: 'man_idle_knife_0',
//           src: '/shooter/Idle_knife/Idle_knife_000.png',
//         },
//         {
//           alias: 'man_idle_knife_1',
//           src: '/shooter/Idle_knife/Idle_knife_001.png',
//         },
//         {
//           alias: 'man_idle_knife_2',
//           src: '/shooter/Idle_knife/Idle_knife_002.png',
//         },
//         {
//           alias: 'man_idle_knife_3',
//           src: '/shooter/Idle_knife/Idle_knife_003.png',
//         },
//         {
//           alias: 'man_idle_knife_4',
//           src: '/shooter/Idle_knife/Idle_knife_004.png',
//         },
//         {
//           alias: 'man_idle_knife_5',
//           src: '/shooter/Idle_knife/Idle_knife_005.png',
//         },
//         {
//           alias: 'man_idle_knife_6',
//           src: '/shooter/Idle_knife/Idle_knife_006.png',
//         },
//         {
//           alias: 'man_idle_knife_7',
//           src: '/shooter/Idle_knife/Idle_knife_007.png',
//         },
//       ]
//     },
//     {
//       name: 'man-walk-knife',
//       assets: [
//         {
//           alias: 'man_walk_knife_0',
//           src: '/shooter/Walk_knife/Walk_knife_000.png',
//         },
//         {
//           alias: 'man_walk_knife_1',
//           src: '/shooter/Walk_knife/Walk_knife_001.png',
//         },
//         {
//           alias: 'man_walk_knife_2',
//           src: '/shooter/Walk_knife/Walk_knife_002.png',
//         },
//         {
//           alias: 'man_walk_knife_3',
//           src: '/shooter/Walk_knife/Walk_knife_003.png',
//         },
//         {
//           alias: 'man_walk_knife_4',
//           src: '/shooter/Walk_knife/Walk_knife_004.png',
//         },
//         {
//           alias: 'man_walk_knife_5',
//           src: '/shooter/Walk_knife/Walk_knife_005.png',
//         },
//       ],
//     },
//     {
//       name: 'man-hit-knife',
//       assets: [
//         {
//           alias: 'man_hit_knife_0',
//           src: '/shooter/Knife/Knife_000.png'
//         },
//         {
//           alias: 'man_hit_knife_1',
//           src: '/shooter/Knife/Knife_001.png'
//         },
//         {
//           alias: 'man_hit_knife_2',
//           src: '/shooter/Knife/Knife_002.png'
//         },
//         {
//           alias: 'man_hit_knife_3',
//           src: '/shooter/Knife/Knife_003.png'
//         },
//         {
//           alias: 'man_hit_knife_4',
//           src: '/shooter/Knife/Knife_004.png'
//         },
//         {
//           alias: 'man_hit_knife_5',
//           src: '/shooter/Knife/Knife_005.png'
//         },
//         {
//           alias: 'man_hit_knife_6',
//           src: '/shooter/Knife/Knife_006.png'
//         },
//         {
//           alias: 'man_hit_knife_7',
//           src: '/shooter/Knife/Knife_007.png'
//         },
//       ]
//     }
//   ]
// }

// const manifest: AssetsManifest = {
//   bundles: [
//     {
//       name: 'man-idle-knife',
//       assets: {
//         'man_idle_knife_0': '/shooter/Idle_knife/Idle_knife_000.png',
//         'man_idle_knife_1': '/shooter/Idle_knife/Idle_knife_001.png',
//         'man_idle_knife_2': '/shooter/Idle_knife/Idle_knife_002.png',
//         'man_idle_knife_3': '/shooter/Idle_knife/Idle_knife_003.png',
//         'man_idle_knife_4': '/shooter/Idle_knife/Idle_knife_004.png',
//         'man_idle_knife_5': '/shooter/Idle_knife/Idle_knife_005.png',
//         'man_idle_knife_6': '/shooter/Idle_knife/Idle_knife_006.png',
//         'man_idle_knife_7': '/shooter/Idle_knife/Idle_knife_007.png',
//       }
//     },
//     {
//       name: 'man-walk-knife',
//       assets: {
//         'man_walk_knife_0': '/shooter/Walk_knife/Walk_knife_000.png',
//         'man_walk_knife_1': '/shooter/Walk_knife/Walk_knife_001.png',
//         'man_walk_knife_2': '/shooter/Walk_knife/Walk_knife_002.png',
//         'man_walk_knife_3': '/shooter/Walk_knife/Walk_knife_003.png',
//         'man_walk_knife_4': '/shooter/Walk_knife/Walk_knife_004.png',
//         'man_walk_knife_5': '/shooter/Walk_knife/Walk_knife_005.png',
//       }
//     },
//     {
//       name: 'man-hit-knife',
//       assets: {
//         'man_hit_knife_0': '/shooter/Knife/Knife_000.png',
//         'man_hit_knife_1': '/shooter/Knife/Knife_001.png',
//         'man_hit_knife_2': '/shooter/Knife/Knife_002.png',
//         'man_hit_knife_3': '/shooter/Knife/Knife_003.png',
//         'man_hit_knife_4': '/shooter/Knife/Knife_004.png',
//         'man_hit_knife_5': '/shooter/Knife/Knife_005.png',
//         'man_hit_knife_6': '/shooter/Knife/Knife_006.png',
//         'man_hit_knife_7': '/shooter/Knife/Knife_007.png',
//       }
//     },
//     {
//       name: 'sample',
//       assets: {

//       }
//     }
//   ]
// }

export class PixelShooter {
  constructor(public map: PixelMap) {
    map.engine.alwaysRender = true
    this.load()
  }

  private async load() {
    Assets.init({ manifest })
    await Assets.loadBundle('man-idle-knife')
    await Assets.loadBundle('man-walk-knife')
    await Assets.loadBundle('man-hit-knife')
    await Assets.loadBundle('man-idle-gun')
    await Assets.loadBundle('man-walk-gun')
    await Assets.loadBundle('man-hit-gun')
    await Assets.loadBundle('man-idle-riffle')
    await Assets.loadBundle('man-walk-riffle')
    await Assets.loadBundle('man-hit-riffle')
    await Assets.loadBundle('man-idle-bat')
    await Assets.loadBundle('man-walk-bat')
    await Assets.loadBundle('man-hit-bat')

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