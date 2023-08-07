import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import CircleStyle from 'ol/style/Circle'
import { EstimatedPosition } from '../../../../domain/entities/estimatedPosition'
import { getColorWithAlpha } from './utils'

const estimatedPositionStyleCache = new Map()

export const getEstimatedPositionStyle = feature => {
  const color = feature.get(EstimatedPosition.colorProperty)
  const opacity = feature.get(EstimatedPosition.opacityProperty)
  const isCircle = feature.get(EstimatedPosition.isCircleProperty)
  const isHidden = feature.get(EstimatedPosition.isHiddenProperty)

  if (isHidden) {
    return []
  }

  const key = JSON.stringify({ color, isCircle, opacity })

  if (!estimatedPositionStyleCache.has(key)) {
    const colorWithAlpha = getColorWithAlpha(color, opacity)

    const style = new Style({
      fill: new Fill({ color: opacity ? color : colorWithAlpha, weight: 4 }),
      stroke: new Stroke({ color: opacity ? color : colorWithAlpha, width: 3 })
    })

    if (isCircle) {
      style.setImage(new CircleStyle({
        radius: 3,
        fill: new Fill({
          color: colorWithAlpha
        })
      }))
    }

    estimatedPositionStyleCache.set(key, [style])
  }

  return estimatedPositionStyleCache.get(key)
}
