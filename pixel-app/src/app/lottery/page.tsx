'use client'

import dynamic from 'next/dynamic'

const ViewLotteryWrapperLoad = () => import('@/components/Wrappers/ViewLotteryWrapper')
const ViewLotteryWrapper = dynamic(ViewLotteryWrapperLoad, {ssr: false})

export default function Home() {
  return (
    <ViewLotteryWrapper />
  )
}
