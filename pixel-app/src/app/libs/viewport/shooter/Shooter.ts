import { Container, Graphics, Sprite, Texture } from 'pixi.js'
import { sound } from '@pixi/sound'

import { AnimatedSprite } from './AnimatedSprite'
import { characterStates, getZombieStates } from './constants'
import { CharacterAttrs, CharacterControl, SHOOTER_SPEED, calculateMoveToTarget } from 'adventure_engine/dist/shooting'
import { PixelShooter } from '.'

const weapons = ['', 'knife', 'gun', 'riffle', 'bat', 'flame']

export class Shooter {

  container = new Container()
  keysPressed: { [key: string]: boolean } = {}
  speed = 4
  attackSpeed = 0.04
  // weapon: 'knife' | 'gun' | 'riffle' | 'bat' = 'riffle'
  type = 'man'

  char: AnimatedSprite

  // only use angle, weapon to draw
  ctrl: CharacterControl

  private curX = 0
  private curY = 0

  // latest server updated position for controlling character,
  // update attrs x, y with these values when not controlling
  // for other not controlling characters,
  // update attrs x, y with server values immediately, hence not use these
  latestServerX = 0
  latestServerY = 0

  private selectingCircle = new Sprite()

  private hpDraw = new Graphics()

  private tick = (delta: number) => {}

  private hurtCount = 0

  constructor(public game: PixelShooter, public id: number, public attrs: CharacterAttrs, private l = 0, private i = 0) {
    if (l === 0) {
      // man
      this.char = new AnimatedSprite(characterStates)
    } else {
      // zombie
      this.attackSpeed = 0.08
      this.speed = 2
      const zombieStates = getZombieStates(l, i)
      this.char = new AnimatedSprite(zombieStates, this.getActionState('walk'))
      this.type = `zombie-lvl${l}-${i}`
    }

    this.ctrl = { id, angle: 0, up: false, down: false, left: false, right: false, fire: false, weapon: 1 }
    this.init()
  }

  init() {
    const engine = this.game.map.engine
    const scene = this.game.map.scene
    const container = this.container
    scene.getMainContainer().addChild(container)

    this.selectingCircle.texture = Texture.from('shooter_select')
    this.selectingCircle.anchor.set(0.5, 0.5)
    this.selectingCircle.width = this.selectingCircle.height = 600
    container.addChild(this.selectingCircle)
    this.showSelect(false)

    const char = this.char

    container.addChild(char.sprite)
    this.curX = this.attrs.x
    this.curY = this.attrs.y
    const size = this.l === 0 ? 1.2 : 1.5
    scene.setImagePosition(container, this.attrs.x / 100, this.attrs.y / 100, size, size)

    char.start()

    this.tick = (dt) => this.updateByCtrl(dt)
    engine.addTick(this.tick)

    container.interactive = true
    container.on('click', () => this.game.select(this.id))

    container.addChild(this.hpDraw)
    this.drawHp()
  }

  drawHp() {
    if (this.l > 0) return
    const pixelSize = this.game.map.scene.options.pixelSize
    const bar = this.hpDraw
    bar.clear()
    bar.beginFill(this.attrs.hp >= 66 ? 'green' : this.attrs.hp > 33 ? 'yellow' : 'red')
    bar.drawRect(-200, -250, 4 * this.attrs.hp, 15)
    bar.endFill()
    bar.lineStyle(2, 'green', 1) // width, color, alpha
    bar.drawRect(-200, -250, 400, 15)
  }

  getHurt() {
    this.hurtCount = 10
  }

  setLatestServer(x: number, y: number) {
    this.latestServerX = x
    this.latestServerY = y
  }

  showSelect(visible: boolean) {
    this.selectingCircle.visible = visible
  }

  setAngle(targetX: number, targetY: number) {
    const scene = this.game.map.scene
    const [x1, y1] = scene.getCanvasXY(this.attrs.x / 100, this.attrs.y / 100)
    const angle = Math.atan2(targetY - y1, targetX - x1) + 1.5 * Math.PI
    this.ctrl.angle = Math.round(angle * 100)
    this.char.sprite.rotation = angle
  }

  stopAnimation() {
    this.game.map.engine.removeTick(this.tick)
    this.char.stop()
  }

  dead() {
    console.log('Man dead', this.attrs)
    this.stopAnimation()
    this.char.switch(this.getActionState('death'))
    this.char.speed = 0.8
    this.char.start(() => {
      this.game.map.scene.getMainContainer().removeChild(this.container)
    })
  }

  private getActionState(action: string): string {
    switch (action) {
      case 'attack':
        return this.l === 0 ? `man-hit-${weapons[this.ctrl.weapon]}` : `zombie-lvl${this.l}-${this.i}-attack`
      case 'walk':
        return this.l === 0 ? `man-walk-${weapons[this.ctrl.weapon]}` : `zombie-lvl${this.l}-${this.i}-walk`
      case 'idle':
        return this.l === 0 ? `man-idle-${weapons[this.ctrl.weapon]}` : `zombie-lvl${this.l}-${this.i}-walk`
      case 'death':
        return this.l === 0 ? `man-death` : `zombie-lvl${this.l}-${this.i}-death`
    }

    return ''
  }

  private updateByCtrl(dt: number) {
    const moving = this.curX !== this.attrs.x || this.curY !== this.attrs.y || this.ctrl.left || this.ctrl.right || this.ctrl.up || this.ctrl.down
    this.updatePos(dt)

    if (this.ctrl.fire) {
      if (!this.char.switchingOnce) {
        // flamethrower speed
        const speed = this.ctrl.weapon === 5 ? 0.08 : this.attackSpeed
        this.char.switchOnce(this.getActionState('attack'), speed)
        this.attackSound()
      }
      if (!this.selectingCircle.visible) {
        this.ctrl.fire = false
      } else {
        
      }
    } else if (moving) {
      this.char.switch(this.getActionState('walk'))
    } else {
      this.char.switch(this.getActionState('idle'))
    }

    // rotate
    this.char.sprite.rotation = this.ctrl.angle / 100

    // get hurt
    if (this.hurtCount > 0) {
      this.hurtCount--
      this.char.sprite.tint = 0xff0000
    } else {
      this.char.sprite.tint = 0xffffff
    }
  }

  private attackSound() {
    let s = ''
    if (this.l < 1) {
      // human
      if (this.ctrl.weapon === 2) s = 'gun'
      else if (this.ctrl.weapon === 1) s = 'knife'
      else if (this.ctrl.weapon === 3) s = 'machingun'
      else if (this.ctrl.weapon === 4) s = 'bat'
      else if (this.ctrl.weapon === 5) s = 'flamethrower'
    } else {
      // zombie
      s = 'zombieatk'
    }

    if (s) this.game.playSound(s, this.curX / 100, this.curY / 100)
  }

  // move toward target
  private updatePos(dt: number) {
    if (this.curX === this.attrs.x && this.curY === this.attrs.y) return

    const d = SHOOTER_SPEED * dt / 10
    console.log('delta time', dt, d)

    // this.curX = moveVal(this.curX, this.attrs.x, d)
    // this.curY = moveVal(this.curY, this.attrs.y, d)

    const [nextX, nextY] = calculateMoveToTarget(this.curX, this.curY, this.attrs.x, this.attrs.y, d)
    this.curX = nextX
    this.curY = nextY
    // console.log('updatePos', this.curX, this.curY)

    this.game.map.scene.setImagePosition(this.container, this.curX / 100, this.curY / 100)
  }
}

function moveVal(cur: number, target: number, d: number): number {
  if (cur === target) return target

  const incr = target > cur
  let val = cur + (incr ? d : -d)
  if (val > target === incr) {
    val = target
  }

  return val
}