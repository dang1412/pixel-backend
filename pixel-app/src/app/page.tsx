'use client'

import dynamic from 'next/dynamic'
import { useCallback } from 'react'

import { PixelArea } from '@/libs/viewport'
import { PixelService } from '@/libs/services'

const ViewDisplayWrapperLoad = () => import('@/components/Wrappers/ViewDisplayWrapper')
const ViewDisplayWrapper = dynamic(ViewDisplayWrapperLoad, {ssr: false})

export default function Home() {
  // const mint = useCallback((area: PixelArea) => {
  //   console.log('mint', area)
  //   ;(async () => {
  //     const service = PixelServices.getInstance()
  //     const rs = await (await service.getService(service.loggingWallet)).mint([100])
  //   })()
  // }, [])

  return (
    <ViewDisplayWrapper />
  )
}
