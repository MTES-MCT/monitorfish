import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import CircleStyle from 'ol/style/Circle'
import { EstimatedPosition } from '../../domain/entities/estimatedPosition'

const estimatedPositionStyleCache = new Map()

export const getEstimatedPositionStyle = feature => {
  const color = feature.get(EstimatedPosition.colorProperty)
  const isShowed = feature.get(EstimatedPosition.isShowedProperty)
  const isCircle = feature.get(EstimatedPosition.isCircleProperty)

  if (!isShowed) {
    return []
  }

  const key = JSON.stringify({ color, isCircle })

  if (!estimatedPositionStyleCache.has(key)) {
    const style = new Style({
      fill: new Fill({ color: color, weight: 4 }),
      stroke: new Stroke({ color: color, width: 3 })
    })

    if (isCircle) {
      style.setImage(new CircleStyle({
        radius: 3,
        fill: new Fill({
          color: color
        })
      }))
    }

    estimatedPositionStyleCache.set(key, [style])
  }

  return estimatedPositionStyleCache.get(key)
}
