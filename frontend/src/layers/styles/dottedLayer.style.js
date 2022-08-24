import Stroke from 'ol/style/Stroke'
import Style from 'ol/style/Style'

import { COLORS } from '../../constants/constants'

export const dottedLayerStyle = new Style({
  stroke: new Stroke({
    color: COLORS.slateGray,
    lineDash: [4, 4],
    width: 2,
  }),
})
