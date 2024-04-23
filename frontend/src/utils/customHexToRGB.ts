export const customHexToRGB = (hexColor: string | undefined): [number, number, number] => {
  if (!hexColor) {
    return [0, 0, 0]
  }
  const [r, g, b] = hexColor.substring(1).match(/.{1,2}/g) ?? []
  if (!r || !g || !b) {
    return [0, 0, 0]
  }

  return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)]
}
