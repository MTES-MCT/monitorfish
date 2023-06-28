import {Style} from 'ol/style'
import Stroke from 'ol/style/Stroke'
import {COLORS} from '../../../../constants/constants'
import {getColorWithAlpha} from './utils'

const labelLineStyleCache = new Map()

export const getLabelLineStyle = feature => {
  const opacity = feature.get('opacity')
  const isHiddenByZoom = feature.get('isHiddenByZoom')
  const key = JSON.stringify(opacity)

  if (isHiddenByZoom) {
    return []
  }

  if (!labelLineStyleCache.has(key)) {
    const colorWithAlpha = getColorWithAlpha(COLORS.slateGray, opacity)

    const style = new Style({
      stroke: new Stroke({
        color: colorWithAlpha,
        lineDash: [4, 4],
        width: 2
      })
    })

    labelLineStyleCache.set(key, [style])
  }

  return labelLineStyleCache.get(key)
}
