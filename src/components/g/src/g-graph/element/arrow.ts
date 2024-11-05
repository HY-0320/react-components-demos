export const Arrow = {
  triangle: (width: number = 10, length: number = 15, d: number = 0) => {
    const begin = d * 2
    const path = `M ${begin},0 L ${begin + length},-${width / 2} L ${begin + length},${width / 2} Z`
    return path
  },
}
