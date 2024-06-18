import { THEME } from '@mtes-mct/monitor-ui'
import { Icon, Style } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

import { InterestPointLine } from './interestPointLine'
import { INTEREST_POINT_STYLE, InterestPointType } from '../utils'

const interestPointStylesCache = new Map()

const lineStyle = new Style({
  stroke: new Stroke({
    color: THEME.color.slateGray,
    lineDash: [4, 4],
    width: 2
  })
})

export const getInterestPointStyle = (feature, resolution) => {
  const type = feature.get(InterestPointLine.typeProperty)
  const isHiddenByZoom = feature.get(InterestPointLine.isHiddenByZoomProperty)

  if (feature?.getId()?.toString()?.includes('line')) {
    if (isHiddenByZoom) {
      return []
    }

    return [lineStyle]
  }

  if (!interestPointStylesCache.has(type)) {
    const filename = getFilename(type)

    const style = new Style({
      image: new Icon({
        offset: [0, 0],
        src: filename
      }),
      zIndex: INTEREST_POINT_STYLE
    })

    interestPointStylesCache.set(type, [style])
  }

  const style = interestPointStylesCache.get(type)

  const SCALE_BASE = 1 / 8 // Scale factor to reduce the size of the icon when dezooming
  const SCALE_ADDITION = 0.3 // Minimum scale number
  const VERTICAL_ICON_OFFSET = 18

  const scale = 1 / resolution ** SCALE_BASE + SCALE_ADDITION
  const verticalIconOffset = VERTICAL_ICON_OFFSET

  const iconImage = style[0].getImage()

  iconImage.setScale(scale)
  iconImage.setDisplacement([0, verticalIconOffset * scale])

  return style
}

const getFilename = (type: InterestPointType) => {
  switch (type) {
    case InterestPointType.CONTROL_ENTITY:
      return 'Point_interet_feature_moyen.png'
    case InterestPointType.FISHING_GEAR:
      return 'Point_interet_feature_engin.png'
    case InterestPointType.FISHING_VESSEL:
      return 'Point_interet_feature_navire.png'
    case InterestPointType.OTHER:
      return 'Point_interet_feature_autre.png'
    default:
      return 'Point_interet_feature_autre.png'
  }
}

export const POIStyle = new Style({
  image: new CircleStyle({
    fill: new Fill({
      color: THEME.color.slateGray
    }),
    radius: 2,
    stroke: new Stroke({
      color: THEME.color.slateGray
    })
  }),
  stroke: new Stroke({
    color: THEME.color.slateGray,
    lineDash: [4, 4],
    width: 2
  })
})
