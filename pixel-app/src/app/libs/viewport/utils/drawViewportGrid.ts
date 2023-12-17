import { Container, Graphics } from 'pixi.js'

export function drawViewportGrid(container: Container, pixelSize: number, worldWidthPixel: number, worldHeightPixel: number) {
  const g = container.addChild(new Graphics())
  g.lineStyle(1, 0x888888, 0.4, undefined, true)

  const worldWidth = worldWidthPixel * pixelSize
  const worldHeight = worldHeightPixel * pixelSize

  // draw vertical lines
  for (let i = 0; i <= worldWidthPixel; i++) {
    const pos = i * pixelSize
    g.moveTo(pos, 0)
    g.lineTo(pos, worldHeight)
  }

  // draw horizon lines
  for (let i = 0; i <= worldHeightPixel; i++) {
    const pos = i * pixelSize
    g.moveTo(0, pos)
    g.lineTo(worldWidth, pos)
  }
}