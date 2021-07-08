import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

const estimatedPositionStyleCache = new Map()

export const getEstimatedPositionStyle = feature => {
  const {
    color,
    isShowed
  } = feature.getProperties()

  if (!isShowed) {
    return []
  }

  if (!estimatedPositionStyleCache.has(color)) {
    estimatedPositionStyleCache.set(color, [new Style({
      fill: new Fill({ color: color, weight: 4 }),
      stroke: new Stroke({ color: color, width: 3 })
    })])
  }

  return estimatedPositionStyleCache.get(color)
}
