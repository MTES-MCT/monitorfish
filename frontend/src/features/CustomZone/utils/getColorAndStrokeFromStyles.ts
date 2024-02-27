import { DEFAULT_ZONE_BORDER, DEFAULT_ZONE_COLOR } from '../constants'

import type { Style } from 'ol/style'

export function getColorAndStrokeFromStyles(styles: Style[]): { color: string; stroke: string } {
  if (!styles.length) {
    return {
      color: DEFAULT_ZONE_COLOR,
      stroke: DEFAULT_ZONE_BORDER
    }
  }

  const style = styles[0]

  return {
    color: style!.getFill()?.getColor()?.toString() ?? DEFAULT_ZONE_COLOR,
    stroke: style!.getStroke()?.getColor()?.toString() ?? DEFAULT_ZONE_BORDER
  }
}
