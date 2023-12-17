import { 
  PixelArea,
  PIXEL_EXPAND_X,
  PIXEL_EXPAND_Y,
  getPixelIndexesFromArea,
  getPixelIndex,
} from '@/libs/viewport'

interface InsidePicks {
  // top-left of the image
  start: [number, number]
  // image width
  imageWidth: number
  // picks inside the image
  pickAreas: PixelArea[]
}

export const insidePicks: InsidePicks[] = [
  {
    start: [49, 39],
    imageWidth: 6,
    pickAreas: [
      { x: 10, y: 3, w: 2, h: 2 },
      { x: 13, y: 4, w: 4, h: 3 },
      { x: 16, y: 6, w: 3, h: 2 },
      { x: 17, y: 12, w: 4, h: 2 },
    ]
  },
  {
    start: [48, 39],
    imageWidth: 1,
    pickAreas: [
      { x: 1, y: 1, w: 2, h: 2 },
    ]
  },
  {
    start: [48, 44],
    imageWidth: 1,
    pickAreas: [
      { x: 1, y: 1, w: 2, h: 1 },
    ]
  },
  {
    start: [49, 44],
    imageWidth: 1,
    pickAreas: [
      { x: 1, y: 1, w: 3, h: 2 },
      { x: 3, y: 2, w: 2, h: 2 },
    ]
  },
  {
    start: [37, 42],
    imageWidth: 5,
    pickAreas: [
      { x: 17, y: 2, w: 3, h: 2 },
      { x: 17, y: 3, w: 1, h: 4 },
      { x: 8, y: 5, w: 2, h: 2 },
    ]
  },
  // Pixel
  {
    start: [48, 48],
    imageWidth: 3,
    pickAreas: [
      { x: 3, y: 4, w: 4, h: 2 },
      { x: 6, y: 5, w: 2, h: 4 },
      { x: 10, y: 12, w: 2, h: 1 },
    ]
  },
  // Sandbox
  {
    start: [56, 34],
    imageWidth: 8,
    pickAreas: [
      { x: 9, y: 4, w: 4, h: 2 },
      { x: 18, y: 6, w: 3, h: 2 },
      { x: 20, y: 7, w: 2, h: 2 },
    ]
  },
]

const MAIN_MAP_WIDTH = 100

function getPixelPickNumberMaps(insidePick: InsidePicks): [Map<number, number>, Map<number, number>, number] {
  const insidePixelPickNumberMap = new Map<number, number>()
  const outsidePixelPickNumberMap = new Map<number, number>()

  const width = insidePick.imageWidth * PIXEL_EXPAND_X
  const start = insidePick.start

  let reward = 0

  for (const area of insidePick.pickAreas) {
    let { x: sx, y: sy, w, h } = area
    reward += w * h
    for (let i = 0; i < w; i++) {
      const x = sx + i
      for (let j = 0; j < h; j++) {
        const y = sy + j
        // inside pixel index
        const index = getPixelIndex(x, y, width)
        increaseMapVal(insidePixelPickNumberMap, index)

        // outside pixel
        const ox = start[0] + Math.floor(x / PIXEL_EXPAND_X)
        const oy = start[1] + Math.floor(y / PIXEL_EXPAND_Y)
        const oindex = getPixelIndex(ox, oy, MAIN_MAP_WIDTH)
        increaseMapVal(outsidePixelPickNumberMap, oindex)
      }
    }
  }

  return [insidePixelPickNumberMap, outsidePixelPickNumberMap, reward]
}

function increaseMapVal(map: Map<number, number>, index: number, val = 1) {
  const cur = map.get(index) || 0
  map.set(index, cur + val)
}

function mergeMap(map1: Map<number, number>, map2: Map<number, number>): Map<number, number> {
  for (const [pixelId, val] of map2.entries()) {
    // map1[pixelId] = (map1[pixelId] || 0) + map2[pixelId]
    increaseMapVal(map1, pixelId, val)
  }

  return map1
}

export const pixelInsidePickmap: Map<number, Map<number, number>> = new Map()
export const outsidePickMap: Map<number, number> = new Map()

function calculateMap(): number {
  // const outsidePickMap: Map<number, number> = new Map()
  // const pixelInsidePickmap: Map<number, Map<number, number>> = new Map()
  let totalReward = 0

  for (const insidePick of insidePicks) {
    const [inmap,outmap, reward] = getPixelPickNumberMaps(insidePick)
    const start = insidePick.start
    const index = getPixelIndex(start[0], start[1], MAIN_MAP_WIDTH)
    pixelInsidePickmap.set(index, inmap)

    mergeMap(outsidePickMap, outmap)

    totalReward += reward
  }

  console.log(outsidePickMap, pixelInsidePickmap)

  return totalReward
}

export const totalReward = calculateMap()
