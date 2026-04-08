import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Style from 'ol/style/Style'

export const EstimatedPositionFeatureColorProperty = 'color'
export const EstimatedPositionFeatureIsCircleProperty = 'isCircle'

const estimatedPositionStyleCache = new Map()

export const getEstimatedPositionStyle = feature => {
  const color = feature.get(EstimatedPositionFeatureColorProperty)
  const isCircle = feature.get(EstimatedPositionFeatureIsCircleProperty)

  const key = JSON.stringify({ color, isCircle })

  if (!estimatedPositionStyleCache.has(key)) {
    const style = new Style({
      fill: new Fill({ color }),
      stroke: new Stroke({ color, width: 3 })
    })

    if (isCircle) {
      style.setImage(
        new CircleStyle({
          fill: new Fill({
            color
          }),
          radius: 3
        })
      )
    }

    estimatedPositionStyleCache.set(key, [style])
  }

  return estimatedPositionStyleCache.get(key)
}
