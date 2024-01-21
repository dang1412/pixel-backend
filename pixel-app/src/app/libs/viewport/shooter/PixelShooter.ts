import { Assets } from 'pixi.js'

import { CharType, CharacterAttrs, CharacterControl, addToPixels, ctrlEqual, defaultCharacterAttrs, initGameState, proceedMoveByCtrl, removeShooter, setMove, shootFirstHitObject, shooterOnPixels } from 'adventure_engine/dist/shooting'

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

  characterAttrsMap: {[id: number]: CharacterAttrs} = {}
  characterTypes: {[id: number]: CharType} = {}
  positionCharactersMap: {[id: number]: number[]} = {}


  buildingBlocks: {[id: number]: boolean}

  stopGame = () => {}

  constructor(public map: PixelMap) {
    map.engine.alwaysRender = true
    const state = initGameState()
    this.buildingBlocks = state.buildingBlocks
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
    Assets.add({alias: 'shooter_select', src: '/pixel_shooter/circle.png'})
    await Assets.load('shooter_select')

    // load zombies
    for (let l = 1; l <= 1; l++) {
      for (let i = 1; i <= 4; i++) {
        for (let act of ['attack', 'death', 'walk']) {
          bundles.push(`zombie-lvl${l}-${i}-${act}`)
        }
      }
    }

    console.log('bundles', bundles)

    // load all
    await Assets.loadBundle(bundles)

    console.log('Done loading')

    // mouse move
    const onmousemove = (ex: number, ey: number, px: number, py: number, cx: number, cy: number) => {
      const shooter = this.idCharacterMap[this.selectingShooterId]
      if (shooter) {
        shooter.setAngle(cx, cy)
      }
    }

    const ondropman = (data: DataTransfer | null, px: number, py: number, x: number, y: number) => {
      const type = Number(data?.getData('type')) || 0
      if (type > 1) {
        // zombie
        // test
        // const l = Number(data?.getData('l')) || 0
        // const i = Number(data?.getData('i')) || 0
        // const shooter = this.addShooter(99, {id: 99, hp: 100, x: px * 100, y: py * 100}, l, i)
        // if (shooter) {
        //   shooter.setLatestServer(px * 100, py * 100)
        // }
      } else {
        // human
      }
      // request new shooter
      this.requestAddShooter(type, px * 100, py * 100)
    }

    this.map.engine.on('mousemove', onmousemove)
    this.map.engine.on('drop', ondropman)

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
        proceedMoveByCtrl(shooter.attrs, shooter.ctrl, this.positionCharactersMap, this.buildingBlocks, 25)
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

    this.stopGame = () => {
      this.map.engine.removeListener('mousemove', onmousemove)
      this.map.engine.removeListener('dropman', ondropman)

      document.removeEventListener('keydown', keydown)
      document.removeEventListener('keyup', keyup)

      clearInterval(intervalID)
    }
  }

  addShooter(id: number, attrs?: CharacterAttrs, type = 0): Shooter | undefined {
    if (!this.idCharacterMap[id]) {
      const [l, i] = typeToLevelIndex(type)
      console.log('addShooter', id, type, l, i)
      const shooter = new Shooter(this, id, {...defaultCharacterAttrs, ...attrs}, l, i)
      this.idCharacterMap[id] = shooter
      this.characterAttrsMap[id] = shooter.attrs

      // add to new pixels
      const onPixels = shooterOnPixels(shooter.attrs)
      addToPixels(this.positionCharactersMap, id, onPixels)

      return shooter
    }
  }

  updateTypes(types: [number, CharType][]) {
    for (const type of types) {
      const [id, t] = type
      this.characterTypes[id] = t
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
    const hitP = shootFirstHitObject(id, angle, this.positionCharactersMap, this.characterAttrsMap, this.buildingBlocks)

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
        this.addShooter(id, attrs, this.characterTypes[id] || 0)

        const shooter = this.idCharacterMap[id]
        // latest server values, for being controlled character to update when stop moving
        shooter.setLatestServer(attrs.x, attrs.y)
        if (id !== this.selectingShooterId) {
          // update current attrs
          this.domove(shooter)
        }

        shooter.attrs.hp = attrs.hp
        shooter.drawHp()
        if (attrs.hp <= 0) {
          this.dodead(shooter)
        }
      }
    }
    console.log('positionCharactersMap', this.positionCharactersMap)
  }

  domove(shooter: Shooter) {
    setMove(shooter.attrs, shooter.latestServerX, shooter.latestServerY, this.positionCharactersMap)
  }

  dodead(shooter: Shooter) {
    console.log('Shooter dead', shooter.id)
    shooter.dead()
    delete this.idCharacterMap[shooter.id]
    removeShooter(shooter.attrs, this.positionCharactersMap)
  }

  requestCtrl(ctrl: CharacterControl) {}
  requestAddShooter(type: number, x: number, y: number) {}
}