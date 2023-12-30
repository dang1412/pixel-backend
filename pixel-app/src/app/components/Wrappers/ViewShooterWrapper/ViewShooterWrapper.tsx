'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// import { PixelService } from '@/libs/services'
// import { useLogin } from '@/components/hooks'
// import { ViewAdventure } from '@/components/Views/ViewAdventure'
// import { PixelAdventure } from '@/libs/viewport'
import { useImages } from '@/components/hooks/useImages'
import { ViewShooter } from '@/components/Views/ViewShooter'

export function ViewShooterWrapper() {
  // const { account } = useLogin()
  // const adventureRef = useRef<PixelAdventure>()

  const { images, loadImages } = useImages()

  useEffect(() => {
    loadImages()
  }, [])

  return (
    <>
      <ViewShooter
        images={images}
      />
    </>
  )
}
