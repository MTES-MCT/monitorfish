import { Circle, Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'

import { getColorWithAlpha, getHashDigitsFromString } from '../../map/layers/styles/utils'
import { DEFAULT_ZONE_BORDER, DEFAULT_ZONE_COLOR, DIGIT_TO_LAYER_COLOR_MAP } from '../constants'

export function computeCustomZoneStyle(uuid: string, name: string): [Style] {
  const defaultStyle = getCustomZoneStyle(getColorWithAlpha(DEFAULT_ZONE_COLOR, 0.4), name)

  const randomDigits = getHashDigitsFromString(uuid)
  if (!randomDigits) {
    return [defaultStyle]
  }

  const color = DIGIT_TO_LAYER_COLOR_MAP.get(randomDigits)
  if (!color) {
    return [defaultStyle]
  }

  return [getCustomZoneStyle(getColorWithAlpha(color, 0.4), name)]
}

function getCustomZoneStyle(color: string | undefined, name: string | undefined) {
  const fill = new Fill({
    color
  })

  const stroke = new Stroke({
    color: DEFAULT_ZONE_BORDER,
    width: 1
  })

  return new Style({
    fill,
    image: new Circle({
      fill,
      radius: 5,
      stroke
    }),
    stroke,
    text: new Text({
      fill: new Fill({ color: DEFAULT_ZONE_BORDER }),
      font: '12px Marianne',
      stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 }),
      text: name
    })
  })
}
