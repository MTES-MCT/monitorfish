import { Icon, Style } from 'ol/style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'

export const drawStyle = new Style({
  image: new Icon({
    opacity: 1,
    src: 'Pointeur_selection_zone.svg',
    scale: 1.5
  }),
  stroke: new Stroke({
    color: '#515151',
    lineDash: [5, 5]
  }),
  fill: new Fill({
    color: 'rgb(255, 255, 255, 0.3)'
  })

})
