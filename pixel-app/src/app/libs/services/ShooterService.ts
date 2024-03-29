import { Client, Session, Socket } from '@heroiclabs/nakama-js'
import { v4 as uuidv4 } from 'uuid'
import { CharacterControl, encodeControls, decodeControls, encodeAttrsArray, CharacterAttrs, decodeAttrsArray, getOpcode, decodeCharacterTypes, CharType } from 'adventure_engine/dist/shooting'

export class ShooterService {
  
  session?: Session
  matchId?: string
  socket: Socket

  handleMatchUpdates?: (attrsArr: CharacterAttrs[]) => void
  handleMatchUpdatedCtrls?: (updatedCtrls: CharacterControl[]) => void
  handleNewChars?: (types: [number, CharType][]) => void

  constructor(public client: Client, ssl: boolean) {
    this.socket = client.createSocket(ssl)
    this.socket.onmatchdata = (state) => {
      const { op_code, data } = state
      const opcode = getOpcode(data.buffer)
      console.log('matchState', opcode, data, state)
      if (opcode === 0) {
        const attrsArr = decodeAttrsArray(data.buffer)
        if (this.handleMatchUpdates) {
          this.handleMatchUpdates(attrsArr)
        }
      } else if (opcode === 1) {
        const ctrls = decodeControls(data.buffer)
        if (this.handleMatchUpdatedCtrls) {
          this.handleMatchUpdatedCtrls(ctrls)
        }
      } else if (opcode === 2) {
        const types = decodeCharacterTypes(data.buffer)
        if (this.handleNewChars) {
          this.handleNewChars(types)
        }
      }
    }
  }

  async joinMatch() {
    const uuid = uuidv4()
    this.session = await this.client.authenticateDevice(uuid, true)
    console.log(this.session)

    if (this.socket) {
      await this.socket.connect(this.session, true)
      const result = await this.client.listMatches(this.session)
      const match = result.matches?.find(m => m.label === 'PixelShooter')
      if (match) {
        this.matchId = match.match_id
        await this.socket.joinMatch(match.match_id)
      }

      // if (result.matches) {
      //   const match = result.matches[0]
      //   console.log("%o: %o/10 players", match.match_id, match.size, match)
      //   this.matchId = match.match_id
      //   await this.socket.joinMatch(match.match_id)
      // }
    }
  }

  leaveMatch() {
    if (this.socket && this.matchId) {
      this.socket.leaveMatch(this.matchId)
    }
  }

  // add shooter - opcode 0
  async requestAddShooter(type: number, x: number, y: number): Promise<string> {
    if (!this.socket || !this.matchId) return 'no socket'

    const data = encodeAttrsArray([{id: type, hp: 0, x, y}]) // not use id, so id is used for type, x, y info
    await this.socket.sendMatchState(this.matchId, 0, new Uint8Array(data))

    return ''
  }

  // request control - opcode 1
  async requestCtrl(opcode: number, ctrl: CharacterControl): Promise<string> {
    if (!this.socket || !this.matchId) return 'no socket'

    const data = encodeControls([ctrl])
    await this.socket.sendMatchState(this.matchId, 1, new Uint8Array(data))

    return ''
  }

  async requestTargetMove(attrs: CharacterAttrs): Promise<string> {
    if (!this.socket || !this.matchId) return 'no socket'

    const data = encodeAttrsArray([attrs])
    await this.socket.sendMatchState(this.matchId, 2, new Uint8Array(data))

    return ''
  }
}