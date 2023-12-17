import { PixelMap } from './PixelMap'
import { CharacterOptions, PixelCharacter } from './PixelCharacter'
import { Sprite, Texture } from 'pixi.js'

interface PixelAction {
  char: PixelCharacter
  targetIndex: number
  type: 0 | 1
}

export class PixelGameMap {
  // characters
  pixelCharacterMap = new Map<number, PixelCharacter>()
  selectingCharacter: PixelCharacter | null = null

  // submap
  pixelToSubGameMap: Map<number, PixelGameMap> = new Map()

  // parent
  parentGameMap: PixelGameMap | undefined

  constructor(public map: PixelMap) {
    map.scene.addImageURL({x: 19, y: 22, w:1, h:1}, '/svgs/car.svg', 'items')
    map.scene.addImageURL({x: 25, y: 20, w:1, h:1}, '/svgs/power.svg', 'items')
    map.scene.addImageURL({x: 15, y: 12, w:1, h:1}, '/svgs/coins.svg', 'items')
    map.scene.addImageURL({x: 24, y: 7, w:1, h:1}, '/svgs/rocket.svg', 'items')
  }

  // open pixel
  async openPixel(x: number, y: number): Promise<PixelGameMap | undefined> {
    const pixelMap = await this.map.openPixel(x, y)
    if (pixelMap) {
      const pixelIndex = this.map.scene.getPixelIndex(x, y)
      if (!this.pixelToSubGameMap.get(pixelIndex)) {
        const gamemap = new PixelGameMap(pixelMap)
        gamemap.parentGameMap = this
        this.pixelToSubGameMap.set(pixelIndex, gamemap)
      }

      return this.pixelToSubGameMap.get(pixelIndex)
    }

    return undefined
  }

  // go parent
  goParentMap(): PixelGameMap | undefined {
    if (this.parentGameMap) {
      this.parentGameMap.map.open()
    }

    return this.parentGameMap
  }

  async addCharacter(x: number, y: number, opts: CharacterOptions, imageUrl?: string) {
    const character = new PixelCharacter(this, x, y, opts, imageUrl)
    const index = this.map.scene.getPixelIndex(x, y)
    this.pixelCharacterMap.set(index, character)
  }

  handleSelect(x: number, y: number): PixelCharacter | undefined {
    const character = this.getCharacter(x, y)
    if (character) {
      if (character !== this.selectingCharacter) {
        character.select()
        if (this.selectingCharacter) {
          this.selectingCharacter.select(false)
        }
        this.selectingCharacter = character
      } else {
        character.select(false)
        this.selectingCharacter = null
      }
    }

    return character
  }

  getCharacter(x: number, y: number): PixelCharacter | undefined {
    const index = this.map.scene.getPixelIndex(x, y)
    return this.pixelCharacterMap.get(index)
  }

  isInRange(x: number, y: number): boolean {
    const character = this.selectingCharacter
    if (!character) return false

    if (character.x === x && character.y === y) return false

    return Math.abs(x - character.x) <= character.range && Math.abs(y - character.y) <= character.range
  }

  private actionMap = new Map<number, PixelAction>()

  registerAction(char: PixelCharacter, x: number, y: number, type: 0 | 1) {
    // TODO ensure order of action?
    const targetIndex = this.map.scene.getPixelIndex(x, y)
    const action: PixelAction = { char, targetIndex, type }
    const index = this.map.scene.getPixelIndex(char.x, char.y)
    this.actionMap.set(index, action)
  }

  hasActions(): boolean {
    return this.actionMap.size > 0
  }

  async execute() {
    this.generateBotActions()
    const intendMoves: PixelAction[] = []
    const intendShoot: PixelAction[] = []
    for (const val of this.actionMap.values()) {
      if (val.type === 0) {
        intendMoves.push(val)
      } else {
        intendShoot.push(val)
      }
    }

    this.actionMap.clear()

    // init all current position as obstacle
    const obstacles = new Set<number>()
    for (const char of this.pixelCharacterMap.values()) {
      const index = this.map.scene.getPixelIndex(char.x, char.y)
      obstacles.add(index)
    }

    const executableMoves: PixelAction[] = []
    let stillchange = true
    while (stillchange) {
      stillchange = false
      for (const move of intendMoves) {
        if (!obstacles.has(move.targetIndex)) {
          executableMoves.push(move)
          // source index become available
          const sourceIndex = this.map.scene.getPixelIndex(move.char.x, move.char.y)
          obstacles.delete(sourceIndex)
          // target index become obstacle
          obstacles.add(move.targetIndex)

          // mark change
          stillchange = true
        }
      }
    }

    const allMoves: Promise<void>[] = []
    for (const move of executableMoves) {
      const char = move.char
      const sourceIndex = this.map.scene.getPixelIndex(char.x, char.y)
      const [tx, ty] = this.map.scene.getPixelXYFromIndex(move.targetIndex)
      allMoves.push(char.move(tx, ty))

      this.pixelCharacterMap.delete(sourceIndex)
      this.pixelCharacterMap.set(move.targetIndex, char)
    }

    this.map.scene.viewport.dirty = true

    // wait all moves done
    await Promise.all(allMoves)
    console.log('done move')

    const allShoots: Promise<void>[] = []
    const deadChars: PixelCharacter[] = []
    for (const shoot of intendShoot) {
      const { char, targetIndex } = shoot
      if (char.alive) {
        const [tx, ty] = this.map.scene.getPixelXYFromIndex(targetIndex)
        allShoots.push(char.shoot(tx, ty))

        const target = this.pixelCharacterMap.get(targetIndex)
        if (target) {
          target.alive = false
          deadChars.push(target)
          this.pixelCharacterMap.delete(targetIndex)
        }
      }
    }

    // wait all shoot done
    await Promise.all(allShoots)

    for (const char of deadChars) {
      char.dead()
    }

    if (this.selectingCharacter && !this.selectingCharacter.alive) {
      this.selectingCharacter = null
    }
  }

  private generateBotActions() {
    const characters = this.pixelCharacterMap.values()
    for (const char of characters) {
      if (char.name === 'Bot') {
        char.actRandom()
      }
    }
  }
}