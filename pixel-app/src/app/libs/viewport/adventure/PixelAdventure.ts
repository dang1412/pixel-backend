import { sound } from '@pixi/sound'

import { PixelMap } from '../PixelMap'
import { CharacterOptions, PixelCharacter } from './PixelCharacter'
import { AdventureUpdate, getPixelXYFromIndex } from 'adventure_engine'
import { WORLD_WIDTH } from '../constants'
import { beastImageMap, itemImages } from './constants'

interface PixelAction {
  char: PixelCharacter
  targetIndex: number
  type: 0 | 1
}

export class PixelAdventure {
  // characters
  pixelCharacterMap = new Map<number, PixelCharacter>()
  idCharacterMap = new Map<number, PixelCharacter>()
  // selectingCharacter: PixelCharacter | null = null

  // // submap
  // pixelToSubGameMap: Map<number, PixelGameMap> = new Map()
  // mainMap: PixelMap

  // parent
  // parentGameMap: PixelGameMap | undefined
  private isInitialized = false

  // shoot or move control mode
  controlMode = 0

  constructor(public map: PixelMap) {
    map.scene.addImageURL({x: 50, y: 43, w:1, h:1}, '/svgs/car.svg', 'items')
    map.scene.addImageURL({x: 43, y: 46, w:1, h:1}, '/svgs/power.svg', 'items')
    map.scene.addImageURL({x: 44, y: 50, w:1, h:1}, '/svgs/coins.svg', 'items')
    map.scene.addImageURL({x: 57, y: 54, w:1, h:1}, '/svgs/rocket.svg', 'items')

    const engine = map.engine

    engine.on('dropbeast', (id: number, px: number, py: number) => {
      // add beast to the map
      // this.addCharacter(px, py, { id, name: `beast-${id}`, range: 4 }, '/images/axie.png')
      // inform server
      // engine.emit('control', px, py, px, py)
      const pixel = this.map.scene.getPixelIndex(px, py)
      this.outputCtrl(2, id, pixel)
    })

    engine.on('dropitem', (id: number, px: number, py: number) => {
      const pixel = this.map.scene.getPixelIndex(px, py)
      this.outputCtrl(99, id, pixel)
    })

    sound.add('move', '/sounds/whistle.mp3')
    sound.add('shoot', '/sounds/sword.mp3')
  }

  drawItemOnMap(id: number, pixel: number) {
    const imageUrl = itemImages[id]
    // will be empty if imageUrl is undefined
    const [x, y] = getPixelXYFromIndex(pixel, WORLD_WIDTH)
    this.map.scene.addImageURL({x, y, w:1, h:1}, imageUrl, 'items')
  }

  /**
   * Output control for beast or item drop
   * @param opcode 
   * - 0: move
   * - 1: shoot
   * - 2: onboard beast
   * - 99: item drop on map
   * @param id 
   * @param pixel 
   * @param type 
   */
  outputCtrl(opcode: number, id: number, pixel: number, type?: number) {
    console.log('outputCtrl', opcode, id, pixel, type)
  }

  async updateMatch(updates: AdventureUpdate) {
    const { moves, shoots, changedBeasts, changedBeastHps, changedBeastEquips, changedPixels, changedPixelItems } = updates
    // clear select before execute actions
    this.map.scene.clearSelect()
    await Promise.all(moves.map(m => this.move(m.beastId, m.pixel)))
    await Promise.all(shoots.map(s => this.shoot(s.beastId, s.pixel)))

    changedBeasts.forEach((beastId, ind) => {
      const beast = this.idCharacterMap.get(beastId)
      if (beast) {
        const health: number = changedBeastHps[ind]
        const equippedItem = changedBeastEquips[ind]
        if (health) {
          beast.drawHp(health)
          beast.drawEquip(equippedItem)
        } else {
          this.kill(beastId)
        }
      }
    })

    // update items on map
    for (let i = 0; i < changedPixels.length; i ++) {
      const pixel = changedPixels[i]
      const item = changedPixelItems[i]
      this.drawItemOnMap(item, pixel)
    }

  }

  // initializeCharacters(characterPositions: [number, number][]) {
  //   if (this.isInitialized) return
  //   this.isInitialized = true

  //   console.log('initializeCharacters', characterPositions)

  //   const map = this.map.parentMap ? this.map.parentMap : this.map

  //   for (let [id, pos] of characterPositions) {
  //     const [x, y] = map.scene.getPixelXYFromIndex(pos)
  //     this.addCharacter(x, y, { id, name: `puppy-${id}`, range: 4 }, '/images/axie.png')
  //   }
  // }

  async move(id: number, pixelId: number): Promise<void> {
    const char = this.idCharacterMap.get(id)
    const [x, y] = this.map.scene.getPixelXYFromIndex(pixelId)
    if (char) {
      const oldpos = this.map.scene.getPixelIndex(char.x, char.y)
      if (oldpos === pixelId) return
      await char.move(x, y)
      this.pixelCharacterMap.set(pixelId, char)

      // delete old pos
      this.pixelCharacterMap.delete(oldpos)

    } else {
      this.addCharacter(x, y, { id, name: `puppy-${id}`, range: 4 }, '/images/axie.png')
    }
  }

  async shoot(charId: number, pixelId: number): Promise<void> {
    const char = this.idCharacterMap.get(charId)
    if (char) {
      let [x, y] = this.map.scene.getPixelXYFromIndex(pixelId)
      await char.shoot(x, y)
    }
  }

  kill(id: number) {
    const beast = this.idCharacterMap.get(id)
    if (beast) {
      const pos = this.map.scene.getPixelIndex(beast.x, beast.y)
      this.pixelCharacterMap.delete(pos)
      beast.dead()
    }
  }

  // open pixel
  async openPixel(x: number, y: number): Promise<PixelMap | null> {
    const pixelMap = await this.map.openPixel(x, y)
    if (pixelMap) {
      this.map = pixelMap
    }
    // if (pixelMap) {
    //   const pixelIndex = this.map.scene.getPixelIndex(x, y)
    //   if (!this.pixelToSubGameMap.get(pixelIndex)) {
    //     const gamemap = new PixelGameMap(pixelMap)
    //     gamemap.parentGameMap = this
    //     this.pixelToSubGameMap.set(pixelIndex, gamemap)
    //   }

    //   return this.pixelToSubGameMap.get(pixelIndex)
    // }

    return pixelMap
  }

  // go parent
  goParentMap(): PixelMap | undefined {
    const parentMap = this.map.parentMap
    if (parentMap) {
      parentMap.open()
      this.map = parentMap
    }

    return parentMap
  }

  async addCharacter(x: number, y: number, opts: CharacterOptions, imageUrl?: string) {
    const id = opts.id
    const type = Math.floor(id / 1000000)
    const character = new PixelCharacter(this, x, y, opts, beastImageMap[type] || imageUrl)
    const index = this.map.scene.getPixelIndex(x, y)
    this.pixelCharacterMap.set(index, character)
    this.idCharacterMap.set(opts.id, character)
  }

  // handleSelect(x: number, y: number): PixelCharacter | undefined {
  //   const character = this.getCharacter(x, y)
  //   if (character) {
  //     if (character !== this.selectingCharacter) {
  //       // select
  //       character.select()
  //       if (this.selectingCharacter) {
  //         this.selectingCharacter.select(false)
  //       }
  //       this.selectingCharacter = character
  //     } else {
  //       // deselect
  //       character.select(false)
  //       this.selectingCharacter = null
  //     }
  //   }

  //   return character
  // }

  getCharacter(x: number, y: number): PixelCharacter | undefined {
    const index = this.map.scene.getPixelIndex(x, y)
    return this.pixelCharacterMap.get(index)
  }

  // isInRange(x: number, y: number): boolean {
  //   const character = this.selectingCharacter
  //   if (!character) return false

  //   if (character.x === x && character.y === y) return false

  //   return Math.abs(x - character.x) <= character.range && Math.abs(y - character.y) <= character.range
  // }

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

    // if (this.selectingCharacter && !this.selectingCharacter.alive) {
    //   this.selectingCharacter = null
    // }
  }

  private generateBotActions() {
    const characters = this.pixelCharacterMap.values()
    for (const char of characters) {
      if (char.name === 'Bot') {
        // char.actRandom()
      }
    }
  }
}