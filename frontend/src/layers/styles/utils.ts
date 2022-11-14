import { asArray, asString } from 'ol/color'
import { Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

export function getStyle(color: string | undefined, isSelected: boolean) {
  return new Style({
    fill: new Fill({
      color
    }),
    stroke: new Stroke({
      color: 'rgba(5, 5, 94, 0.7)',
      width: isSelected ? 3 : 1
    })
  })
}

/**
 * Given a color in hex format and a alpha number, returns the color as an rgba string.
 */
export function getColorWithAlpha(colorHex: string, alpha: number) {
  const [r, g, b] = asArray(colorHex)

  if (!Number.isInteger(r) || !Number.isInteger(g) || !Number.isInteger(b)) {
    return undefined
  }

  return asString([
    Number.parseInt(String(r), 10),
    Number.parseInt(String(g), 10),
    Number.parseInt(String(b), 10),
    alpha
  ])
}
