import { Style } from 'ol/style'
import Stroke from 'ol/style/Stroke'
import { COLORS } from '../../constants/constants'

export const labelLineStyle = new Style({
  stroke: new Stroke({
    color: COLORS.slateGray,
    lineDash: [4, 4],
    width: 2
  })
})
