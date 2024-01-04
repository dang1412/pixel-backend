import { Assets } from 'pixi.js'

import { CharacterAttrs, CharacterControl, ctrlEqual, defaultCharacterAttrs } from 'adventure_engine/dist/shooting'

import { PixelMap } from '../PixelMap'
import { Shooter } from './Shooter'
import { manifest } from './constants'

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
    let tickCount = 0
    this.map.engine.addTick(() => {
      const shooter = this.idCharacterMap[this.selectingShooterId]
      if (tickCount === 0 && shooter) {
        if (!this.lastCtrl || !ctrlEqual(shooter.ctrl, this.lastCtrl)) {
          this.lastCtrl = Object.assign({}, shooter.ctrl)
          this.requestCtrl(shooter.ctrl)
        }
      }
      tickCount = (tickCount + 1) % 5
    })
  }

  addShooter(id: number, attrs?: CharacterAttrs) {
    if (!this.idCharacterMap[id]) {
      this.idCharacterMap[id] = new Shooter(this, id, {...defaultCharacterAttrs, ...attrs})
    }
  }

  updateCtrls(ctrls: CharacterControl[]) {
    for (let ctrl of ctrls) {
      const char = this.idCharacterMap[ctrl.id]
      if (!char) continue

      if (ctrl.id === this.selectingShooterId && !ctrlEqual(char.ctrl, ctrl)) {
        // chances are the current ctrl is newer, update server
        this.requestCtrl(char.ctrl)
      } else {
        // update
        char.ctrl = ctrl
      }
    }
  }

  updateMatch(attrsArr: CharacterAttrs[]) {
    for (const attrs of attrsArr) {
      const id = attrs.id
      if (id >= 0 && attrs) {
        this.addShooter(id, attrs)

        const shooter = this.idCharacterMap[id]
        // update current attrs
        shooter.attrs = attrs
      }
    }
  }

  requestCtrl(ctrl: CharacterControl) {}
  requestAddShooter(x: number, y: number) {}
}