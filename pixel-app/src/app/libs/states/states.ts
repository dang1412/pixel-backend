import { atom } from 'recoil'
import { PixelImage, PixelInfo } from '../viewport'

export interface AccountState {
  addr: string
  alias: string
}

export const accountState = atom<AccountState>({
  key: 'accountState',
  default: { addr: '', alias: '' }
})

export const loadingState = atom({
  key: 'loadingState',
  default: 0
})

export enum NotificationType {
  Error,
  Info,
  Success,
}

export interface INotification {
  type: NotificationType
  key: string
  content: string
}

export const notificationState = atom<INotification[]>({
  key: 'notificationState',
  default: []
})

export const pixelsState = atom<PixelInfo[]>({
  key: 'pixelsState',
  default: []
})

export const ownedPixelsState = atom<number[]>({
  key: 'ownedPixelsState',
  default: []
})

export const imagesState = atom<PixelImage[]>({
  key: 'imagesState',
  default: []
})
