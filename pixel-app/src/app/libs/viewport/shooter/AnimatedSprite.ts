import { Container, Sprite, Texture } from 'pixi.js'

export class AnimatedSprite {
  curState: string
  sprite = new Sprite()
  speed = 0.15

  playing = false

  private count = 0
  private running = true

  constructor(public states: {[state: string]: string[]}) {
    this.curState = Object.keys(states)[0]
    this.sprite.texture = Texture.from(states[this.curState][0])

    this.run()
  }

  play() {
    this.playing = true
  }

  pause() {
    this.playing = false
  }

  switch(state: string) {
    if (this.curState !== state) {
      this.curState = state
      this.count = 0
    }
  }

  stop() {
    this.running = false
  }

  private run() {
    if (this.playing) {
      this.sprite.texture = Texture.from(this.states[this.curState][this.count])
      this.count = (this.count + 1) % this.states[this.curState].length
    }

    if (this.running) setTimeout(() => this.run(), this.speed * 1000)
  }
}