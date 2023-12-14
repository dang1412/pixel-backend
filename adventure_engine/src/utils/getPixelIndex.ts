export function getPixelIndex(x: number, y: number, w: number): number {
  return y * w + x
}

export function getPixelXYFromIndex(index: number, w: number): [number, number] {
  const x = index % w
  const y = (index - x) / w
  return [x, y]
}