import { Container, Sprite, Texture } from 'pixi.js'

export class AnimatedSprite {
  curState: string
  sprite = new Sprite()
  speed = 0.15

  playing = false

  private count = 0
  private running = false
  private onFinishedOneRun = () => {}
  private switchingOnce = false
  private started = false

  constructor(public states: {[state: string]: string[]}, state = '') {
    this.curState = state || Object.keys(states)[0]
    this.sprite.texture = Texture.from(states[this.curState][0])
    this.sprite.anchor.set(0.5, 0.5)
  }

  start(runOnce?: () => void) {
    if (this.started) return
    this.started = true
    this.running = true
    this.playing = true

    if (runOnce) {
      this.onFinishedOneRun = () => {
        this.stop()
        runOnce()
      }
    }
    this.run()
  }

  play() {
    this.playing = true
  }

  pause() {
    this.playing = false
  }

  switch(state: string) {
    if (this.curState !== state && !this.switchingOnce) {
      console.log('switch', this.curState, state)
      this.curState = state
      this.count = 0
    }
  }

  switchOnce(state: string, speed: number) {
    if (this.switchingOnce) return
    console.log('switchOnce', this.curState, state)
    const oldSpeed = this.speed
    this.speed = speed
    this.switch(state)
    this.switchingOnce = true
    this.onFinishedOneRun = () => {
      this.switchingOnce = false
      this.speed = oldSpeed
      this.onFinishedOneRun = () => {}
    }
  }

  stop() {
    this.running = false
    this.started = false
  }

  private run() {
    if (this.playing) {
      this.sprite.texture = Texture.from(this.states[this.curState][this.count])
      this.count = (this.count + 1) % this.states[this.curState].length
      if (this.count === 0) setTimeout(() => this.onFinishedOneRun(), this.speed * 1000)
    }

    if (this.running) setTimeout(() => this.run(), this.speed * 1000)
  }
}