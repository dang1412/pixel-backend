import { Client, Socket } from '@heroiclabs/nakama-js'

import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { ApiPromise, WsProvider } from '@polkadot/api'
import type { Weight } from '@polkadot/types/interfaces'
import { ContractPromise } from '@polkadot/api-contract'

import { ImageMeta, PixelArea, PixelImage, PixelInfo, getPixelIndexesFromArea } from '@/libs/viewport'

import metadata from './ink/pixel.json'
import { CONTRACT_ADDRESS, WS_ENDPOINT } from './ink'

import {
  Result, apiUrl, doMessage, doQuery,
  mapImageFromApi, mapPixelFromApi, mapSubImageFromApi,
  stringNumberToBN, updateImagesWithMeta
} from './utils'
import { ApiPixel, ApiPixelImage, IIPFSService } from './types'
import { AccountState, appGlobal } from '../states'
import { LotteryService } from './LotteryService'
import { AdventureService } from './AdventureService'
import { ShooterService } from './ShooterService'

const wsProvider = new WsProvider(WS_ENDPOINT)

export class PixelService {

  // Get service singleton
  static instancePromise: Promise<PixelService>
  static async getInstance(): Promise<PixelService> {
    if (!this.instancePromise) {
      this.instancePromise = new Promise<PixelService>(async (res) => {
        const api = await ApiPromise.create({ provider: wsProvider })
        // lazy load IPFSService
        const ipfs = await import('./IPFSService').then(m => m.IPFSService).then(IPFSService => IPFSService.getInstance(apiUrl))
        // let ipfs = await create({ url: apiUrl })
        const service = new PixelService(api, ipfs)
        res(service)
      })
    }
    return this.instancePromise
  }

  //
  public account?: InjectedAccountWithMeta
  private accounts?: InjectedAccountWithMeta[]
  private contract: ContractPromise

  lotteryService: LotteryService
  adventureService: AdventureService
  shooterService: ShooterService

  constructor(public api: ApiPromise, public ipfs: IIPFSService) {
    this.contract = new ContractPromise(
      api,
      metadata,
      CONTRACT_ADDRESS
    )

    const ssl = false
    const client = new Client('defaultkey', '192.168.1.96', '7350', ssl)
    
    // const ssl = true
    // const client = new Client('defaultkey', 'api.millionpixelland.com', '443', ssl)
    // const socket = client.createSocket(true)

    this.lotteryService = new LotteryService(api)
    this.adventureService = new AdventureService(api, client, ssl)
    this.shooterService = new ShooterService(client, ssl)
  }

  async uploadImageWithUrl(url: string): Promise<string> {
    const res = await fetch(url)
    const file = await res.blob()

    return this.uploadImage(file)
  }

  async uploadImage(file: Blob): Promise<string> {
    return this.ipfs.add(file)
  }

  async uploadMeta(meta: ImageMeta): Promise<string> {
    return this.ipfs.add(JSON.stringify(meta))
  }

  async login(w: string): Promise<AccountState> {
    const extensions = await web3Enable('Pixelland')
    // let accounts = this.accounts = await web3Accounts({ extensions: ['polkadot-js'] })
    let accounts = this.accounts = await web3Accounts({ extensions: [w] })
    console.log(accounts, extensions)

    return this.setAccount(0)
  }

  setAccount(i: number): AccountState {
    if (this.accounts && this.accounts[i]) {
      this.account = this.accounts[i]
      this.lotteryService.setAccount(this.account)
      this.adventureService.setAccount(this.account)
      // return this.account.meta.name || this.account.address
      return { addr: this.account.address, alias: this.account.meta.name || '' }
    }

    // not found account
    return { addr: '', alias: '' }
  }

  getAccounts() {
    return this.accounts
  }

  logout() {
    this.account = undefined
    this.accounts = undefined
    this.lotteryService.setAccount()
    this.adventureService.setAccount()
  }

  async getPixels(): Promise<PixelInfo[]> {
    const [gasLimit, rs] = await this.doQuery<ApiPixel[]>('pixelTrait::getMeaningfulPixels', [])
    if (!rs.ok) {
      return []
    }

    console.log('getPixels', rs.value)

    const pixels = rs.value.map(mapPixelFromApi)

    // update global pixels map
    pixels.forEach((p, i) => {
      appGlobal.pixelMap.set(p.pixelId, p)
    })

    return pixels
  }

  async getOwnedPixels(): Promise<number[]> {
    const [gasLimit, rs] = await this.doQuery<string[]>('getOwnedPixels', [])
    if (!rs.ok) {
      return []
    }

    const pixels = rs.value.map(p => stringNumberToBN(p).toNumber())

    return pixels
  }

  /**
   * Get main map images
   * @param w world width
   * @returns 
   */
  async getImages(worldWidth: number): Promise<[PixelImage[], string[]]> {
    const [_, rs] = await this.doQuery<ApiPixelImage[]>('pixelTrait::getImages', [])

    if (!rs.ok) {
      return [[], []]
    }

    const images = rs.value.map(i => mapImageFromApi(i, worldWidth))
    const metacids = rs.value.map(i => i.metaCid) // for lazyload

    // load meta, TODO lazyload
    await updateImagesWithMeta(images, metacids)

    // update global images map
    rs.value.forEach((img, i) => {
      const pixelId = stringNumberToBN(img.pixelId).toNumber()
      // set image owner
      const owner = appGlobal.pixelMap.get(pixelId)?.owner
      images[i].owner = owner

      // update global
      appGlobal.imageMap.set(pixelId, images[i])
    })

    return [images, metacids]
  }

  /**
   * Get sub map images inside area
   * @param area
   * @param worldWidth
   * @returns 
   */
  async getSubImages(area: PixelArea, worldWidth: number): Promise<PixelImage[]> {
    const pixelIds = getPixelIndexesFromArea(area, worldWidth)

    // const apiImages = (await Promise.all(pixelIds.map(pixel => this.doQuery<ApiPixelImage[]>('getSubImagesMultiple', [pixel]))))
    //   .map(rs => rs[1])
    //   .map(rs => rs.ok ? rs.value : [])
    //   .flat()
    const [_, rs] = await this.doQuery<ApiPixelImage[]>('pixelTrait::getMultipleSubImages', [pixelIds])
    const apiImages = rs.ok ? rs.value : []

    const images = apiImages.map(i => mapSubImageFromApi(i, area))
    const metacids = apiImages.map(i => i.metaCid) // for lazyload

    // load meta, TODO lazyload
    updateImagesWithMeta(images, metacids)

    return images
  }

  async mint(pixelIds: number[]): Promise<string> {
    return this.doMessage('pixelTrait::mint', [pixelIds])
  }

  async setImage(pixel: number, w: number, h: number, cid: string, meta?: string, subpixel?: number): Promise<string> {
    return this.doMessage('pixelTrait::setImage', [pixel, [w, h], cid, meta, subpixel])
  }

  async doMessage(method: string, params: any[]): Promise<string> {
    return doMessage(this.api, this.contract, method, params, this.account)
  }

  private async doQuery<T>(method: string, params: unknown[]): Promise<[Weight, Result<T, string>]> {
    return doQuery(this.api, this.contract, method, params, this.account)
  }
}
