import { ApiPromise, WsProvider } from '@polkadot/api'

import { IPixelService } from './IPixelService'

const wsProvider = new WsProvider('wss://ws.test.azero.dev')

export enum WalletType {
  meta,
  polka,
  none
}

// lazy load metamask serivce
async function getMetaService(): Promise<IPixelService> {
  const service = await import('./PixelMetaService').then(m => m.PixelMetaService).then(PixelMetaService => new PixelMetaService())

  return service
}

// lazy load polkadot.js service
// async function getPolkaService(api: ApiPromise): Promise<IPixelService> {
//   const service = await import('./PixelPolkaService').then(m => m.PixelPolkaService).then(PixelPolkaService => new PixelPolkaService(api))

//   return service
// }

export class PixelService {
  servicesMap: Map<WalletType, IPixelService> = new Map()

  static instance: PixelService
  static getInstance(): PixelService {
    if (!this.instance) {
      this.instance = new PixelService()
    }
    return this.instance
  }

  // api
  api: Promise<ApiPromise> | undefined

  constructor() {
    this.api = ApiPromise.create({ provider: wsProvider })
  }

  loggingAccount: string = ''
  loggingWallet = WalletType.none

  async getService(wallet: WalletType): Promise<IPixelService> {
    if (this.api && !this.servicesMap.get(wallet)) {
      const api = await this.api
      const service = wallet === WalletType.meta ? await getMetaService() : undefined
      if (service) this.servicesMap.set(wallet, service)
    }
  
    return this.servicesMap.get(wallet)!
  }

  async login(wallet: WalletType): Promise<string> {
    const walletService = await this.getService(wallet)
    const account = await walletService.getBrowserAddress()

    this.loggingAccount = account
    this.loggingWallet = wallet

    return account
  }

  logout() {
    this.loggingAccount = ''
    this.loggingWallet = WalletType.none
  }
}
