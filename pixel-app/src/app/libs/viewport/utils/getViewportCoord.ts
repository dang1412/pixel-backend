import { Viewport } from 'pixi-viewport'

export function getViewportCoord(viewport: Viewport, pixelSize: number, worldWidthPixel: number, worldHeightPixel: number, x: number, y: number): [number, number, boolean] {
  const wx = x / viewport.scaled + viewport.left
  const wy = y / viewport.scaled + viewport.top

  let outside = false

  let px = Math.floor(wx / pixelSize)
  let py = Math.floor(wy / pixelSize)

  if (px < 0) {
    px = 0
    outside = true
  }
  if (px >= worldWidthPixel) {
    px = worldWidthPixel - 1
    outside = true
  }

  if (py < 0) {
    py = 0
    outside = true
  }
  if (py >= worldHeightPixel) {
    py = worldHeightPixel - 1
    outside = true
  }

  return [px, py, outside]
}

export function getCanvasXY(viewport: Viewport, pixelSize: number, px: number, py: number): [number, number] {
  const cx = (px * pixelSize - viewport.left) * viewport.scaled
  const cy = (py * pixelSize - viewport.top) * viewport.scaled

  return [cx, cy]
}