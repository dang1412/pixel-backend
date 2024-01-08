import { Assets } from 'pixi.js'

import { CharacterAttrs, CharacterControl, ctrlEqual, defaultCharacterAttrs, proceedAttrsByCtrl, shootFirstHitObject } from 'adventure_engine/dist/shooting'

import { PixelMap } from '../PixelMap'
import { Shooter } from './Shooter'
import { gunhitState, manifest } from './constants'
import { AnimatedSprite } from './AnimatedSprite'

export class PixelShooter {

  idCharacterMap: {[id: number]: Shooter} = {}
  selectingShooterId = 0

  private lastCtrl: CharacterControl | undefined

  constructor(public map: PixelMap) {
    map.engine.alwaysRender = true
  }

  select(id: number) {
    // deselect
    const prevSelect = this.selectingShooterId
    const prevChar = this.idCharacterMap[prevSelect]
    if (prevChar) {
      prevChar.showSelect(false)
    }

    if (id !== this.selectingShooterId) {
      const char = this.idCharacterMap[id]
      if (char) {
        char.showSelect(true)
        this.selectingShooterId = id
      }
    } else {
      this.selectingShooterId = 0
    }
  }

  async load() {
    Assets.init({ manifest })
    await Assets.loadBundle([
      'man-idle-knife',
      'man-walk-knife',
      'man-hit-knife',
      'man-idle-gun',
      'man-walk-gun',
      'man-hit-gun',
      'man-idle-riffle',
      'man-walk-riffle',
      'man-hit-riffle',
      'man-idle-bat',
      'man-walk-bat',
      'man-hit-bat',
      'gunhit',
    ])
    Assets.add({alias: 'shooter_select', src: '/pixel_shooter/circle.png'})
    await Assets.load('shooter_select')

    console.log('Done loading')

    // mouse move
    this.map.engine.on('mousemove', (ex: number, ey: number, px: number, py: number, cx: number, cy: number) => {
      const shooter = this.idCharacterMap[this.selectingShooterId]
      if (shooter) {
        shooter.setAngle(cx, cy)
      }
    })

    this.map.engine.on('dropman', (px: number, py: number) => {
      // request onMatch new shooter
      this.requestAddShooter(px * 100, py * 100)
    })

    // key pressed
    let lastFireTime = 0
    document.addEventListener('keydown', (e) => {
      const shooter = this.idCharacterMap[this.selectingShooterId]
      if (!shooter) return
      if (e.key === '1') {  // knife
        shooter.ctrl.weapon = 1
      } else if (e.key === '2') { // gun
        shooter.ctrl.weapon = 2
      } else if (e.key === '3') { // riffle
        shooter.ctrl.weapon = 3
      } else if (e.key === '4') { // bat
        shooter.ctrl.weapon = 4
      }

      if (e.key === 'a') {
        shooter.ctrl.left = true
      } else if (e.key === 'd') {
        shooter.ctrl.right = true
      } else if (e.key === 'w') {
        shooter.ctrl.up = true
      } else if (e.key === 's') {
        shooter.ctrl.down = true
      }

      if (e.key === 'f') {
        // let time = Date.now()
        // if (time - lastFireTime > 1000) {
          
        // }
        shooter.ctrl.fire = true
      }
      
      console.log('keydown', e.key)
    })
    document.addEventListener('keyup', (e) => {
      const shooter = this.idCharacterMap[this.selectingShooterId]
      if (!shooter) return
      if (e.key === 'a') {
        shooter.ctrl.left = false
      } else if (e.key === 'd') {
        shooter.ctrl.right = false
      } else if (e.key === 'w') {
        shooter.ctrl.up = false
      } else if (e.key === 's') {
        shooter.ctrl.down = false
      }

      if (e.key === 'f') {
        shooter.ctrl.fire = false
      }

      console.log('keyup', e.key)
    })

    // request ctrl periodically
    let count = 0
    setInterval(() => {
      const shooter = this.idCharacterMap[this.selectingShooterId]
      if (!shooter) return
      const moved = shooter.ctrl.up || shooter.ctrl.down || shooter.ctrl.left || shooter.ctrl.right
      const controlled =  moved || shooter.ctrl.fire || this.lastCtrl?.weapon !== shooter.ctrl.weapon || this.lastCtrl?.angle !== shooter.ctrl.angle
      if (controlled) {
        this.lastCtrl = Object.assign({}, shooter.ctrl)
        // request control to server
        this.requestCtrl(shooter.ctrl)
        // predict own move
        proceedAttrsByCtrl(shooter.attrs, shooter.ctrl, 25)
        // predict own shoot
        // if (shooter.ctrl.fire) this.shoot(this.selectingShooterId)
      }

      if (!moved) {
        // counting
        count ++
        if (count > 4) {
          // update with latest server values if stand for more than 3 counts
          shooter.updateWithLatestServer()
        }
      } else {
        count = 0
      }
    }, 80)
  }

  addShooter(id: number, attrs?: CharacterAttrs) {
    if (!this.idCharacterMap[id]) {
      this.idCharacterMap[id] = new Shooter(this, id, {...defaultCharacterAttrs, ...attrs})
    }
  }

  // process ctrl signals from server
  updateCtrls(ctrls: CharacterControl[]) {
    for (let ctrl of ctrls) {
      const char = this.idCharacterMap[ctrl.id]
      if (!char) continue

      if (ctrl.id !== this.selectingShooterId) {
        // update from server
        char.ctrl.weapon = ctrl.weapon
        char.ctrl.fire = ctrl.fire
        char.ctrl.angle = ctrl.angle
      }

      if (ctrl.fire) {
        // perform shoot locally
        if (ctrl.weapon === 2 || ctrl.weapon === 3) this.shoot(ctrl.id)
      }
    }
  }

  // perform shoot locally
  shoot(id: number) {
    const char = this.idCharacterMap[id]
    if (!char) return

    const objs: [number, number, number, number][] = Object.values(this.idCharacterMap).map(char => [char.attrs.x - 50, char.attrs.y - 50, 100, 100])
    const angle = char.ctrl.angle / 100 - 1.5 * Math.PI
    const hitP = shootFirstHitObject(char.attrs.x, char.attrs.y, angle, objs)

    console.log('hitP', objs, hitP)
    if (hitP) {
      const animatedHit = new AnimatedSprite(gunhitState)
      animatedHit.speed = 0.1
      animatedHit.sprite.rotation = angle + Math.PI / 2
      this.map.scene.getMainContainer().addChild(animatedHit.sprite)
      this.map.scene.setImagePosition(animatedHit.sprite, hitP[1] / 100, hitP[2] / 100, 1, 1)

      animatedHit.start(() => {
        this.map.scene.getMainContainer().removeChild(animatedHit.sprite)
      })
    }
  }

  // update 
  updateMatch(attrsArr: CharacterAttrs[]) {
    for (const attrs of attrsArr) {
      const id = attrs.id
      if (id >= 0 && attrs) {
        this.addShooter(id, attrs)

        const shooter = this.idCharacterMap[id]
        // latest server values, for being controlled character to update when stop moving
        shooter.setLatestServer(attrs.x, attrs.y)
        if (id !== this.selectingShooterId) {
          // update current attrs
          shooter.attrs = attrs
        }
      }
    }
  }

  requestCtrl(ctrl: CharacterControl) {}
  requestAddShooter(x: number, y: number) {}
}