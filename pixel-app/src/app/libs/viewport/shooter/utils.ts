const type2LevelIndex: {[type: number]: [number, number]} = {
  2: [1, 1],
  3: [1, 2],
  4: [1, 3],
  5: [1, 4],
  6: [2, 1],
  7: [2, 2],
}

export function typeToLevelIndex(type: number): [number, number] {
  return type2LevelIndex[type] || [0, 0]
}