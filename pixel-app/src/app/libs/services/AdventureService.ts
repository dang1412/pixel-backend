import { ApiPromise } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract'
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
// import { IEventLike } from '@polkadot/types/types/events'
// import type { Bytes } from '@polkadot/types'

import { Client, Match, Session, Socket } from '@heroiclabs/nakama-js'
import { v4 as uuidv4 } from 'uuid'
import { AdventureUpdate, decodeMatchUpdate } from 'adventure_engine'

// import WebSocket from 'ws'


// import { Builder, ByteBuffer } from 'flatbuffers'

import metadata from './ink/pixel_adventure.json'
import { CONTRACT_ADDRESS_ADVENTURE } from './ink'
import { doMessage, doQuery } from './utils'

// import { BeastAction } from './buffer/beast-action'
// import { UpdateState } from './buffer/update-state'
// import { decodeMatchUpdate } from './buffer/decodeMatchUpdate'

const MATCH_NAME = 'PixelAdventure'

// Encoding Function
function encodeAction(id: number, target: number): Uint8Array {
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)

  view.setInt32(0, id, true)
  view.setInt32(4, target, true)

  return new Uint8Array(buffer)
}

// Decoding Function
function decodeAction(data: Uint8Array): [number, number] {
  const buffer = data.buffer
  const view = new DataView(buffer)

  const num1 = view.getInt32(0, true)
  const num2 = view.getInt32(4, true)

  return [num1, num2]
}

// function encodeAction(id: number, target: number): Uint8Array {
//   let builder = new Builder(1024)
//   builder.startObject(1)
//   BeastAction.createBeastAction(builder, id, target)
//   const end = builder.endObject()
//   builder.finish(end)

//   return builder.asUint8Array()
// }

// function decodeBeastAction(data: Uint8Array): any {
//   const buffer = new ByteBuffer(data)
//   const beastAction = new BeastAction()
//   beastAction.__init(0, buffer)

//   return {
//     id: beastAction.id(),
//     target: beastAction.target()
//   }
// }

export class AdventureService {
  private contract: ContractPromise
  private account?: InjectedAccountWithMeta

  // ws: WebSocket
  client: Client
  session?: Session
  socket?: Socket
  matchId?: string

  handleMatchUpdates?: (updates: AdventureUpdate) => void

  constructor(private api: ApiPromise) {
    let contract = this.contract = new ContractPromise(
      api,
      metadata,
      CONTRACT_ADDRESS_ADVENTURE
    )

    const address = CONTRACT_ADDRESS_ADVENTURE

    // api.query.system.events((encodedEvent: { event: IEventLike, phase: any }[]) => {
    //   // console.log(`\nReceived ${encodedEvent.length} events:`);

    //   encodedEvent.forEach(({ event }) => {
    //     if (contract.api.events.contracts?.ContractEmitted?.is(event)) {
    //       const [contractAddress, contractEvent] = event.data;
    //       if (
    //         !address ||
    //         !contractAddress ||
    //         !contractEvent ||
    //         contractAddress.toString().toLowerCase() !== address.toLowerCase()
    //       )
    //         return;

    //       try {
    //         const decodedEvent = contract.abi.decodeEvent(
    //           contractEvent as Bytes,
    //         );

    //         const eventItem = {
    //           address,
    //           event: {
    //             name: decodedEvent.event.identifier,
    //             args: decodedEvent.args.map((v) => v.toHuman()),
    //           },
    //         }

    //         const event = {
    //           name: decodedEvent.event.identifier,
    //           args: decodedEvent.args.map((v) => stringToNumber(v.toHuman() as string)),
    //         }

    //         if (this.handleEvent) {
    //           this.handleEvent(event)
    //         }

    //         console.log(eventItem);
    //       } catch (e) {
    //         console.error(e);
    //       }
    //     }
    //   })

    // })

    // const ws = this.ws = new WebSocket('ws://localhost:8080')

    // ws.onopen = () => {
    //   console.log('Connection is open')
    // }

    // ws.onmessage = (msg) => {
    //   console.log('onmessage', msg.data)
    // }

    // this.client = new Client('defaultkey', 'api.millionpixelland.com', '443', true)
    this.client = new Client('defaultkey', '127.0.0.1', '7350', false)
    this.socket = this.client.createSocket(false)
    this.socket.onmatchdata = (matchState) => {
      console.log('matchState', matchState.data)
      const updates = decodeMatchUpdate(matchState.data)
      if (this.handleMatchUpdates) {
        this.handleMatchUpdates(updates)
      }
    }
    console.log('this.socket', this.socket)
  }

  async setAccount(account?: InjectedAccountWithMeta) {
    this.account = account
    // this.joinMatch()

    // if (account) {
    //   this.session = await this.client.authenticateDevice(account.address, true)
    //   console.log(this.session)
      
    //   if (this.socket) {
    //     await this.socket.connect(this.session, true)
    //     // const match = this.match = await this.socket.createMatch(MATCH_NAME)
    //     // await this.socket.joinMatch(match.match_id)
    //     // console.log('joined match', match)

    //     const result = await this.client.listMatches(this.session)

    //     if (result.matches) {
    //       const match = result.matches[0]
    //       console.log("%o: %o/10 players", match.match_id, match.size, match)
    //       this.matchId = match.match_id
    //       await this.socket.joinMatch(match.match_id)
    //     }
    //   }
    // }
  }

  async joinMatch() {
    const uuid = uuidv4()
    this.session = await this.client.authenticateDevice(uuid, true)
    console.log(this.session)

    if (this.socket) {
      await this.socket.connect(this.session, true)
      // const match = this.match = await this.socket.createMatch(MATCH_NAME)
      // await this.socket.joinMatch(match.match_id)
      // console.log('joined match', match)

      const result = await this.client.listMatches(this.session)

      if (result.matches) {
        const match = result.matches[0]
        console.log("%o: %o/10 players", match.match_id, match.size, match)
        this.matchId = match.match_id
        await this.socket.joinMatch(match.match_id)
      }
    }
  }

  // get alive puppies on main map
  async get_alives(): Promise<[number, number][]> {
    const [_, rs] = await doQuery<[string, string][]>(this.api, this.contract, 'adventureTrait::getBeastOnboard', [])

    if (!rs.ok) {
      return []
    }

    return []

    // return rs.value.map(([p, c]) => [stringToNumber(p), stringToNumber(c)])
  }

  async onboardNew(pixelId: number): Promise<number> {
    const rs = await doMessage(this.api, this.contract, 'adventureTrait::onboard', [pixelId])

    return 0
  }

  // async move(beastId: number, pixelId: number): Promise<string> {
  //   // this.ws.send(JSON.stringify({ type: 0, id: charId, pixel: pixelId }))
  //   if (!this.socket || !this.matchId) return 'no socket'

  //   console.log('Move sendMatchState', beastId, pixelId)
  //   const data = encodeAction(beastId, pixelId)

  //   await this.socket.sendMatchState(this.matchId, 0, data)

  //   return ''
  //   // return doMessage(this.api, this.contract, 'adventureTrait::actionMove', [charId, pixelId], this.account)
  // }

  // async shoot(beastId: number, pixelId: number): Promise<string> {
  //   // this.ws.send(JSON.stringify({ type: 1, id: charId, pixel: pixelId }))
  //   if (!this.socket || !this.matchId) return 'no socket'

  //   const data = encodeAction(beastId, pixelId)
  //   await this.socket.sendMatchState(this.matchId, 1, data)

  //   return ''
  //   // return doMessage(this.api, this.contract, 'adventureTrait::actionShoot', [charId, pixelId], this.account)
  // }

  // async onboard(beastId: number, pixelId: number): Promise<string> {
  //   if (!this.socket || !this.matchId) return 'no socket'

  //   const data = encodeAction(beastId, pixelId)
  //   await this.socket.sendMatchState(this.matchId, 2, data)

  //   return ''
  // }

  async requestAction(opcode: number, beastId: number, pixelId: number, type?: number): Promise<string> {
    if (!this.socket || !this.matchId) return 'no socket'

    const data = encodeAction(beastId, pixelId)
    await this.socket.sendMatchState(this.matchId, opcode, data)

    return ''
  }
}
