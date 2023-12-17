import { IPFSHTTPClient, create } from 'ipfs-http-client'

import { IIPFSService } from './types'

export class IPFSService implements IIPFSService {
  static async getInstance(url: string): Promise<IPFSService> {
    let ipfs = await create({ url })
    return new IPFSService(ipfs)
  }

  constructor(public ipfs: IPFSHTTPClient) {}

  async add(data: Blob | string): Promise<string> {
    const { cid } = await this.ipfs.add(data)

    return cid.toString()
  }
}
