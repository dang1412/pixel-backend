// import { ImageMeta } from '../types'
import { ImageMeta } from '@/libs/viewport'


export const IPFS_ADDR = 'api.millionpixelland.com'

export const apiUrl = `https://${IPFS_ADDR}`

export function ipfsURL(cid: string): string {
  return `https://${IPFS_ADDR}/ipfs/${cid}`
}

const _cache: { [cid: string]: Promise<ImageMeta> } = {}

export async function getImageMeta(cid: string): Promise<ImageMeta> {
  if (!_cache[cid]) {

    // http://127.0.0.1:8080/ipfs/QmPZvVPVU4Km3UrcjHxgTStfk4ehV2B3Wiq9oKZtJLLJyu
    // const url = `https://ipfs.io/ipfs/${cid}`
    const url = ipfsURL(cid)
    // const res = await fetch(url)
    _cache[cid] = fetch(url).then(res => res.json())
  }

  return _cache[cid]
}
