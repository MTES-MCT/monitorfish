import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

export const getEstimatedPositionStyle = feature => {
  const color = feature.getProperties().color

  return [new Style({
    fill: new Fill({ color: color, weight: 4 }),
    stroke: new Stroke({ color: color, width: 3 })
  })]
}
