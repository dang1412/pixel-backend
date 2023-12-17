import { ApiPromise, WsProvider } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract'
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { BN } from '@polkadot/util'

import { PIXEL_EXPAND_X, PixelArea, WORLD_WIDTH, getPixelIndex, getPixelIndexesFromArea, getSubPixel, getXYInAreaFromSubpixel } from '../viewport'

import metadata from './ink/pixel_lottery.json'
import { CONTRACT_ADDRESS_LOTTERY } from './ink'
import { doMessage, doQuery, stringToNumber } from './utils'

export class LotteryService {
  private contract: ContractPromise
  private account?: InjectedAccountWithMeta

  constructor(private api: ApiPromise) {
    this.contract = new ContractPromise(
      api,
      metadata,
      CONTRACT_ADDRESS_LOTTERY
    )
  }

  setAccount(account?: InjectedAccountWithMeta) {
    this.account = account
  }

  // get picked count on main map
  async getPixelPickedCount(): Promise<[number, number][]> {
    const [_, rs] = await doQuery<[string, string][]>(this.api, this.contract, 'lotteryTrait::getPixelPickedCount', [])

    if (!rs.ok) {
      return []
    }

    return rs.value.map(([p, c]) => [stringToNumber(p), stringToNumber(c)])
  }

  // get picked count in an area (submap)
  async getAreaPickedCount(area: PixelArea): Promise<[number, number][]> {
    const pixelIndexes = getPixelIndexesFromArea(area, WORLD_WIDTH)

    const queries = pixelIndexes.map(index => doQuery<[string, string][]>(this.api, this.contract, 'lotteryTrait::getSubpixelPickedCount', [index]))

    const results = (await Promise.all(queries)).map(([_, rs]) => rs.ok ? rs.value : [])

    const pickedCount: [number, number][] = []

    for (let i = 0; i < pixelIndexes.length; i++) {
      const pixelId = pixelIndexes[i]
      const rs = results[i].map(([p, c]) => {
        const [x, y] = getXYInAreaFromSubpixel(area, pixelId, stringToNumber(p))
        const pixelIdInArea = getPixelIndex(x, y, area.w * PIXEL_EXPAND_X)

        return [pixelIdInArea, stringToNumber(c)] as [number, number]
      })

      pickedCount.push(...rs)
    }

    return pickedCount
  }

  async pick(areaInParent: PixelArea, area: PixelArea): Promise<string> {
    const pixelSubpixelValMap = new Map<number, BN>()
    for (let dx = 0; dx < area.w; dx++) {
      for (let dy = 0; dy < area.h; dy++) {
        const [pixel, subpixel] = getSubPixel(areaInParent, area.x + dx, area.y + dy)
        const val = pixelSubpixelValMap.get(pixel) || new BN(0)
        const addVal = new BN(2).pow(new BN(subpixel))
        console.log(val.toString(), addVal.toString(), subpixel)
        pixelSubpixelValMap.set(pixel, val.add(addVal))
      }
    }

    const pixels = Array.from(pixelSubpixelValMap).map(([key, val]) => [key, val.toString()])

    console.log('Picking', pixels)

    // return Promise.resolve('error')

    return doMessage(this.api, this.contract, 'lotteryTrait::pick', [pixels], this.account)
  }
}
