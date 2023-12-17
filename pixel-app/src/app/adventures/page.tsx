'use client'

import dynamic from 'next/dynamic'

const ViewGameWrapperLoad = () => import('@/components/Wrappers/ViewGameWrapper')
const ViewGameWrapper = dynamic(ViewGameWrapperLoad, {ssr: false})

export default function Home() {
  return (
    <ViewGameWrapper />
  )
}
