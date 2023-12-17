import React from 'react'
import { PixelMap } from '@/libs/viewport'
import { useLogin } from '@/components/hooks'

interface PixelOverProps {
  x: number
  y: number
  map: PixelMap
}

const _PixelOver: React.FC<PixelOverProps> = ({x, y, map}) => {
  const { account } = useLogin()
  const image = map.getImage(x, y)
  let owner = map.getPixelOwner(x, y)
  if (owner === account.addr) {
    owner = account.alias
  }
  const pickNumber = map.getPickedNumber(x, y)
  const isWinningPoint = map.lotteryMode && map.isWinningPoint(x, y)

  return (
    <div>
      {isWinningPoint && <div className='font-semibold text-yellow-500'>*** Winning Pixel ***</div>}
      {pickNumber > 0 && <div>Picked: {pickNumber}</div>}
      {owner && <div>Owner: {owner}</div>}
      {image ? (
        <div>
          ({x}, {y}) {image.area.w} x {image.area.h} <br/>
          <span style={{fontWeight: 'bold'}}>{image.title}</span><br/>
          <span>{image.subtitle}</span><br/>
          <span><a href={image.link} target='blank'>{image.link}</a></span><br/>
        </div>
      ) : <>({x}, {y})<br/></>}
    </div>
  )
}

export const PixelOver = React.memo(_PixelOver)