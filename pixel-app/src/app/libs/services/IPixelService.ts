export interface IPixelService {
  getBrowserAddress(): Promise<string>
  mint(pixelIds: number[]): Promise<void>
}
