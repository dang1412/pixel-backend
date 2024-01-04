'use client'

import dynamic from 'next/dynamic'

const ViewShooterWrapperLoad = () => import('@/components/Wrappers/ViewShooterWrapper')
const ViewShooterWrapper = dynamic(ViewShooterWrapperLoad, {ssr: false})

export default function Home() {
  return (
    <ViewShooterWrapper />
  )
}
