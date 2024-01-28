import { Assets } from 'pixi.js'
import { sound } from '@pixi/sound'

import {
  CharType, CharacterAttrs, CharacterControl, ShootingGameState, addToPixels,
  defaultCharacterAttrs, initGameState, proceedMoveByCtrl, removeShooter,
  setMove, shootFirstHitObject, shooterOnPixels
} from 'adventure_engine/dist/shooting'

import { PixelMap } from '../PixelMap'
import { Shooter } from './Shooter'
import { gunhitState, manifest } from './constants'
import { AnimatedSprite } from './AnimatedSprite'
import { typeToLevelIndex } from './utils'

export class PixelShooter {

  idCharacterMap: {[id: number]: Shooter} = {}
  selectingShooterId = 0

  private lastCtrl: CharacterControl | undefined
  // [id, x, y, w, h][]

  state: ShootingGameState

  stopGame = () => {}

  constructor(public map: PixelMap) {
    map.engine.alwaysRender = true
    this.state = initGameState()
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
    const bundles: string[] = [
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
      'man-idle-flame',
      'man-walk-flame',
      'man-hit-flame',
      'gunhit',
      'man-death',
    ]
    Assets.add('tilebg', '/pixel_shooter/ground_tile.png')
    Assets.add({alias: 'shooter_select', src: '/pixel_shooter/circle.png'})
    await Assets.load('shooter_select')
    await Assets.load('tilebg')

    // load zombies
    for (let l = 1; l <= 1; l++) {
      for (let i = 1; i <= 4; i++) {
        for (let act of ['attack', 'death', 'walk']) {
          bundles.push(`zombie-lvl${l}-${i}-${act}`)
        }
      }
    }

    // load all
    await Assets.loadBundle(bundles)

    sound.add('knife', '/pixel_shooter/knife-slice.mp3')
    sound.add('gun', '/pixel_shooter/sound-gun-shot.mp3')
    sound.add('machingun', '/pixel_shooter/machin-gun.mp3')
    sound.add('bat', '/pixel_shooter/wooden.mp3')
    sound.add('flamethrower', '/pixel_shooter/flamethrower.mp3')

    sound.add('zombieatk', '/pixel_shooter/zombie-attack.mp3')

    console.log('Done loading')

    this.initGame()
  }

  initGame() {
    // mouse move
    const onmousemove = (ex: number, ey: number, px: number, py: number, cx: number, cy: number) => {
      const shooter = this.idCharacterMap[this.selectingShooterId]
      if (shooter) {
        shooter.setAngle(cx, cy)
      }
    }

    const ondropman = (data: DataTransfer | null, px: number, py: number, x: number, y: number) => {
      const type = Number(data?.getData('type')) || 0
      // request new shooter
      this.requestAddShooter(type, px * 100, py * 100)
    }

    this.map.engine.on('mousemove', onmousemove)
    this.map.engine.on('drop', ondropman)
    this.map.engine.on('click', (px: number, py: number) => {
      console.log('Map click', px, py)
      if (this.selectingShooterId) {
        // this.requestTargetMove({id: this.selectingShooterId, hp: 0, x: px * 100 + 50, y: py * 100 + 50})
      }
    })

    // key pressed
    let lastFireTime = 0
    const keydown = (e: KeyboardEvent) => {
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
      } else if (e.key === '5') { // flame
        shooter.ctrl.weapon = 5
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
    }

    const keyup = (e: KeyboardEvent) => {
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
    }
    document.addEventListener('keydown', keydown)
    document.addEventListener('keyup', keyup)

    // request ctrl periodically
    let count = 0
    const intervalID = setInterval(() => {
      const shooter = this.idCharacterMap[this.selectingShooterId]
      if (!shooter) return
      const moved = shooter.ctrl.up || shooter.ctrl.down || shooter.ctrl.left || shooter.ctrl.right
      const controlled =  moved || shooter.ctrl.fire || this.lastCtrl?.weapon !== shooter.ctrl.weapon || this.lastCtrl?.angle !== shooter.ctrl.angle
      if (controlled) {
        this.lastCtrl = Object.assign({}, shooter.ctrl)
        // request control to server
        this.requestCtrl(shooter.ctrl)
        // predict own move
        proceedMoveByCtrl(this.state, shooter.id, shooter.ctrl, 25)
      }

      if (!moved) {
        // counting
        count ++
        if (count > 4) {
          // update with latest server values if stand for more than 3 counts
          this.domove(shooter)
        }
      } else {
        count = 0
      }
    }, 100)

    this.map.scene.setTileBg('tilebg', 2)

    this.stopGame = () => {
      this.map.engine.removeListener('mousemove', onmousemove)
      this.map.engine.removeListener('dropman', ondropman)

      document.removeEventListener('keydown', keydown)
      document.removeEventListener('keyup', keyup)

      clearInterval(intervalID)

      // stop all shooter
      for (const shooter of Object.values(this.idCharacterMap)) {
        shooter.stopAnimation()
      }

      this.map.engine.destroy()
    }
  }

  playSound(s: string, sx: number, sy: number) {
    // get viewport center
    const {x, y} = this.map.scene.viewport.center
    const pixelSize = this.map.scene.options.pixelSize
    const [cx, cy] = [x / pixelSize, y / pixelSize]
    const d = Math.sqrt(Math.pow(cx - sx, 2) + Math.pow(cy - sy, 2))
    console.log('playSound', cx, cy, sx, sy, d)

    const maxHearDistance = 20
    if (d < maxHearDistance) sound.play(s, {volume: (maxHearDistance - d)/maxHearDistance})
  }

  addShooter(id: number, attrs?: CharacterAttrs, type = 0): Shooter | undefined {
    if (!this.idCharacterMap[id]) {
      const [l, i] = typeToLevelIndex(type)
      console.log('addShooter', id, type, l, i)
      const shooter = new Shooter(this, id, {...defaultCharacterAttrs, ...attrs}, l, i)
      this.idCharacterMap[id] = shooter
      this.state.characterAttrsMap[id] = shooter.attrs

      // add to new pixels
      const onPixels = shooterOnPixels(shooter.attrs)
      addToPixels(this.state.positionCharactersMap, id, onPixels)

      return shooter
    }
  }

  updateTypes(types: [number, CharType][]) {
    for (const type of types) {
      const [id, t] = type
      this.state.characterTypes[id] = t
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

    const angle = char.ctrl.angle / 100 - 1.5 * Math.PI
    const hitP = shootFirstHitObject(this.state, id, angle)

    console.log('hitP', hitP)
    if (hitP) {
      const animatedHit = new AnimatedSprite(gunhitState)
      animatedHit.speed = 0.1
      animatedHit.sprite.rotation = angle + Math.PI / 2
      this.map.scene.getMainContainer().addChild(animatedHit.sprite)
      this.map.scene.setImagePosition(animatedHit.sprite, hitP[1], hitP[2], 1, 1)

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
        this.addShooter(id, attrs, this.state.characterTypes[id] || 0)

        const shooter = this.idCharacterMap[id]
        // latest server values, for being controlled character to update when stop moving
        shooter.setLatestServer(attrs.x, attrs.y)
        if (id !== this.selectingShooterId) {
          // update current attrs
          this.domove(shooter)
        }

        if (attrs.hp < shooter.attrs.hp) shooter.getHurt()
        shooter.attrs.hp = attrs.hp
        shooter.drawHp()
        if (attrs.hp <= 0) {
          this.dodead(shooter)
        }
      }
    }
  }

  domove(shooter: Shooter) {
    setMove(shooter.attrs, shooter.latestServerX, shooter.latestServerY, this.state.positionCharactersMap)
  }

  dodead(shooter: Shooter) {
    console.log('Shooter dead', shooter.id)
    shooter.dead()
    delete this.idCharacterMap[shooter.id]
    removeShooter(shooter.attrs, this.state.positionCharactersMap)
  }

  requestCtrl(ctrl: CharacterControl) {}
  requestAddShooter(type: number, x: number, y: number) {}
  requestTargetMove(attrs: CharacterAttrs) {}
}