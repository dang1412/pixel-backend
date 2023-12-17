import { BrowserProvider, Contract, JsonRpcProvider, Wallet } from 'ethers'

import { IPixelService } from './IPixelService'

export const GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b"
export const GENESIS_ACCOUNT_PRIVATE_KEY = "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342"

const USER1_PRIVATE_KEY = '0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342'
const USER1_ETH_ADDR = '0x6be02d1d3665660d22ff9624b7be0551ee1ac91b'

const CONTRACT_ADDR = '0x0000000000000000000000000000000000000402'
const CONTRACT_ABI = 
[
  "function mint_pixels(uint32[] pixel_id) external",
]
// [
//   {
//     "inputs": [
//       {
//           "name": "pixel_id",
//           "type": "uint32"
//       }
//     ],
//     "name": "mint_pixel",
//     "outputs": [],
//     "stateMutability": "nonpayable",
//     "type": "function"
//   }
// ]

export class PixelMetaService implements IPixelService {
  provider: BrowserProvider
  contract: Contract | undefined

  constructor() {
    if (!window.ethereum) {
      throw Error(`Metamask not available`)
    }

    const provider = this.provider = new BrowserProvider(window.ethereum)

    ;(async () => {
      const signer = await provider.getSigner();
      this.contract = new Contract(CONTRACT_ADDR, CONTRACT_ABI, signer)
    })()
  }

  async getBrowserAddress(): Promise<string> {
    // const signer = await this.provider.getSigner();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    return accounts[0]
  }

  async mint(pixelIds: number[]): Promise<void> {
    if (!this.contract) return

    const rs = await this.contract.mint_pixels(pixelIds)

    // Provider connect to local node
    // const provider = new JsonRpcProvider('http://127.0.0.1:9944')
    // // Signer
    // const signer = new Wallet(USER1_PRIVATE_KEY, provider)
    // // Contract
    // const contract = new Contract(CONTRACT_ADDR, CONTRACT_ABI, signer)

    // const rs = await contract.mint_pixel(pixelId)
    console.log(rs)
  }
}
