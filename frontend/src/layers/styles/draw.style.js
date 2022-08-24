import { Icon, Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

import { COLORS } from '../../constants/constants'

export const drawStyle = new Style({
  fill: new Fill({
    color: 'rgb(255, 255, 255, 0.3)',
  }),
  image: new Icon({
    opacity: 1,
    scale: 1.5,
    src: 'Pointeur_selection_zone.svg',
  }),
  stroke: new Stroke({
    color: COLORS.slateGray,
    lineDash: [5, 5],
  }),
})
