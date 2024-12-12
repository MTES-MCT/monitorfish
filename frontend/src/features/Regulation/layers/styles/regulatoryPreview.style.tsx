import { getColorWithAlpha } from '@features/Map/layers/styles/utils'
import { Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

import { COLORS } from '../../../../constants/constants'

export const regulatoryPreviewStyle = new Style({
  fill: new Fill({
    color: getColorWithAlpha('#7B9FCC', 0.4)
  }),
  stroke: new Stroke({
    color: getColorWithAlpha(COLORS.charcoal, 0.75)
  })
})
