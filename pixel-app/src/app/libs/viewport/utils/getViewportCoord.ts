import { Viewport } from 'pixi-viewport'

export function getViewportCoord(viewport: Viewport, pixelSize: number, worldWidthPixel: number, worldHeightPixel: number, x: number, y: number): [number, number, boolean] {
  const wx = x / viewport.scaled + viewport.left
  const wy = y / viewport.scaled + viewport.top

  let outside = false

  let xCoord = Math.floor(wx / pixelSize)
  let yCoord = Math.floor(wy / pixelSize)

  if (xCoord < 0) {
    xCoord = 0
    outside = true
  }
  if (xCoord >= worldWidthPixel) {
    xCoord = worldWidthPixel - 1
    outside = true
  }

  if (yCoord < 0) {
    yCoord = 0
    outside = true
  }
  if (yCoord >= worldHeightPixel) {
    yCoord = worldHeightPixel - 1
    outside = true
  }

  return [xCoord, yCoord, outside]
}