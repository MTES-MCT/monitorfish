import { Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

import { COLORS } from '../../constants/constants'
import { getColorWithAlpha } from '../../utils'

export const regulatoryPreviewStyle = new Style({
  fill: new Fill({
    color: getColorWithAlpha('#7B9FCC', 0.75),
  }),
  stroke: new Stroke({
    color: getColorWithAlpha(COLORS.charcoal, 0.75),
  }),
})
