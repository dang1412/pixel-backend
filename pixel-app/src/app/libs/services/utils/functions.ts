import { BN } from '@polkadot/util'

import { PixelArea, PixelImage, PixelInfo, getPixelXYFromIndex, getXYInAreaFromSubpixel } from '@/libs/viewport'
import { ApiPixel, ApiPixelImage } from '../types'
import { getImageMeta, ipfsURL } from './ipfs'


export const stringToNumber = (valWithCommas: string): number => {
  const v = valWithCommas.split(',').join('')
  return Number(v)
}

// convert string with commas to a BN e.g. 1,000,000  to new BN('1_000_000')
export const stringNumberToBN = (valWithCommas: string): BN => {
  const v = valWithCommas.split(',').join('')
  return new BN(v)
}

export function mapImageFromApi(apiImg: ApiPixelImage, w: number): PixelImage {
  const { pixelId: pixelStr, size_, imageCid } = apiImg

  const pixelId = stringToNumber(pixelStr)
  const [x, y] = getPixelXYFromIndex(pixelId, w)

  return {
    area: {x, y, w: Number(size_[0]), h: Number(size_[1])},
    imageUrl: ipfsURL(imageCid),
    link: '',
    subtitle: '',
    title: ''
  }
}

export function mapSubImageFromApi(apiImg: ApiPixelImage, area: PixelArea): PixelImage {
  const { pixelId: pixelStr, size_, imageCid, subPixelId: subPixelIdStr } = apiImg
  const pixelId = stringNumberToBN(pixelStr).toNumber()
  const subPixelId = stringNumberToBN(subPixelIdStr || '0').toNumber()

  const [x, y] = getXYInAreaFromSubpixel(area, pixelId, subPixelId)

  return {
    area: {x, y, w: Number(size_[0]), h: Number(size_[1])},
    imageUrl: ipfsURL(imageCid),
    link: '',
    subtitle: '',
    title: ''
  }
}

export async function updateImagesWithMeta(images: PixelImage[], metacids: string[]): Promise<PixelImage[]> {
  const metas = await Promise.all(metacids.map(mcid => getImageMeta(mcid)))

  // update image with meta info
  images.forEach((image, i) => {
    const meta = metas[i]
    if (meta) {
      image.title = meta.title
      image.subtitle = meta.subtitle
      image.link = meta.link
    }
  })

  return images
}

export function mapPixelFromApi(p: ApiPixel): PixelInfo {
  return {
    pixelId: stringNumberToBN(p[0]).toNumber(),
    owner: p[1],
    dateMinted: 0,
    price: 0,
  }
}
