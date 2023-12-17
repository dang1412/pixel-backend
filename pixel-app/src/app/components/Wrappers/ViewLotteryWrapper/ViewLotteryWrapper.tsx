'use client'

import { useCallback, useEffect, useState } from 'react'


import { PixelArea } from '@/libs/viewport'
import { NotificationType } from '@/libs/states'
import { PixelService } from '@/libs/services'

import { useLoading } from '@/components/hooks/useLoading'
import { useNotification } from '@/components/hooks/useNotification'
import { ViewLotteryGame } from '@/components/Views/ViewLotteryGame'

export function ViewLotteryWrapper() {
  const { updateLoading } = useLoading()
  const { notify } = useNotification()

  // pick pixels
  const pick = useCallback(async (areaInParent: PixelArea, area: PixelArea) => {
    console.log('picking', areaInParent, area)
    updateLoading(1)
    const service = (await PixelService.getInstance()).lotteryService
    const error = await service.pick(areaInParent, area)

    notify(error ? NotificationType.Error : NotificationType.Success, 'pick', error || `Picked ${area} successful`)

    updateLoading(-1)

    return error
  }, [])

  const [pixelPickedNumber, setPixelPickedNumber] = useState<[number, number][]>([])

  useEffect(() => {
    (async () => {
      const service = (await PixelService.getInstance()).lotteryService
      const pixelPickedNumber = await service.getPixelPickedCount()
      setPixelPickedNumber(pixelPickedNumber)
    })()
  }, [])

  const loadPickedArea = useCallback(async (area: PixelArea) => {
    const service = (await PixelService.getInstance()).lotteryService
    const pickedCount = await service.getAreaPickedCount(area)

    return pickedCount
  }, [])

  return (
    <>
      <ViewLotteryGame
        pick={pick}
        pixelPickedNumber={pixelPickedNumber}
        loadPickedArea={loadPickedArea}
      />
    </>
  )
}
