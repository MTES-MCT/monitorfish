import { THEME } from '@mtes-mct/monitor-ui'
import { Icon, Style } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

import { InterestPointLine } from '../../../../domain/entities/interestPointLine'
import { INTEREST_POINT_STYLE, InterestPointType } from '../../../../domain/entities/interestPoints'

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
  const scale = 1 / resolution ** (1 / 8) + 0.3
  const verticalIconOffset = 18
  style[0].getImage().setScale(scale)
  style[0].getImage().setDisplacement([0, verticalIconOffset * scale])

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
