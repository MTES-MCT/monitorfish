import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Style from 'ol/style/Style'

import { getColorWithAlpha } from '../../../Map/layers/styles/utils'

export const EstimatedPositionFeatureColorProperty = 'color'
export const EstimatedPositionFeatureOpacityProperty = 'opacity'
export const EstimatedPositionFeatureIsCircleProperty = 'isCircle'
export const EstimatedPositionFeatureIsHiddenProperty = 'isHidden'

const estimatedPositionStyleCache = new Map()

export const getEstimatedPositionStyle = feature => {
  const color = feature.get(EstimatedPositionFeatureColorProperty)
  const opacity = feature.get(EstimatedPositionFeatureOpacityProperty)
  const isCircle = feature.get(EstimatedPositionFeatureIsCircleProperty)
  const isHidden = feature.get(EstimatedPositionFeatureIsHiddenProperty)

  if (isHidden) {
    return []
  }

  const key = JSON.stringify({ color, isCircle, opacity })

  if (!estimatedPositionStyleCache.has(key)) {
    const colorWithAlpha = getColorWithAlpha(color, opacity)

    const style = new Style({
      fill: new Fill({ color: opacity ? color : colorWithAlpha }),
      stroke: new Stroke({ color: opacity ? color : colorWithAlpha, width: 3 })
    })

    if (isCircle) {
      style.setImage(
        new CircleStyle({
          fill: new Fill({
            color: colorWithAlpha
          }),
          radius: 3
        })
      )
    }

    estimatedPositionStyleCache.set(key, [style])
  }

  return estimatedPositionStyleCache.get(key)
}
