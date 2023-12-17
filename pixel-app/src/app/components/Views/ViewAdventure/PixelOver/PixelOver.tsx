import React from 'react'
import { PixelAdventure, PixelMap } from '@/libs/viewport'

interface PixelOverProps {
  x: number
  y: number
  game: PixelAdventure
}

const _PixelOver: React.FC<PixelOverProps> = ({x, y, game}) => {
  const character = game.getCharacter(x, y)
  const map = game.map
  const image = map.getImage(x, y)

  // const inRange = game.isInRange(x, y)
  // const isCharacterSelecting = character === game.selectingCharacter

  // if (inRange) {
  //   game.map.scene.selectArea({x, y, w: 1, h: 1})
  // } else {
    // game.map.scene.clearSelect()
  // }

  return (
    <div>
      {character && (
        // <div>{character.name}, range: {character.range}, {inRange ? '' : isCharacterSelecting ? 'Click to deselect' : 'Click to select'}</div>
        <div>{character.name}, range: {character.range}</div>
      )}
      {image ? (
        <div>
          ({x}, {y}) {image.area.w} x {image.area.h} <br/>
          <span style={{fontWeight: 'bold'}}>{image.title}</span><br/>
          <span>{image.subtitle}</span><br/>
          <span><a href={image.link} target='blank'>{image.link}</a></span><br/>
        </div>
      ) : <>({x}, {y})<br/></>}
      {/* {inRange && (
        <div>
          <span>Move</span> or&nbsp;
          <span>Shoot</span>
        </div>
      )} */}
    </div>
  )
}

export const PixelOver = React.memo(_PixelOver)