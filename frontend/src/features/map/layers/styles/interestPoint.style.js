import { Icon, Style } from 'ol/style'
import { INTEREST_POINT_STYLE, interestPointType } from '../../../../domain/entities/interestPoints'
import { InterestPointLine } from '../../../../domain/entities/interestPointLine'
import Stroke from 'ol/style/Stroke'
import { COLORS } from '../../../../constants/constants'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'

const interestPointStylesCache = new Map()

const lineStyle = new Style({
  stroke: new Stroke({
    color: COLORS.slateGray,
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
        src: filename,
        offset: [0, 0],
        imgSize: [30, 79]
      }),
      zIndex: INTEREST_POINT_STYLE
    })

    interestPointStylesCache.set(type, [style])
  }

  const style = interestPointStylesCache.get(type)
  style[0].getImage().setScale(1 / Math.pow(resolution, 1 / 8) + 0.3)

  return style
}

const getFilename = type => {
  switch (type) {
    case interestPointType.CONTROL_ENTITY: return 'Point_interet_feature_moyen.png'
    case interestPointType.FISHING_GEAR: return 'Point_interet_feature_engin.png'
    case interestPointType.FISHING_VESSEL: return 'Point_interet_feature_navire.png'
    case interestPointType.OTHER: return 'Point_interet_feature_autre.png'
  }
}

export const POIStyle = new Style({
  stroke: new Stroke({
    color: COLORS.slateGray,
    lineDash: [4, 4],
    width: 2
  }),
  image: new CircleStyle({
    radius: 2,
    stroke: new Stroke({
      color: COLORS.slateGray
    }),
    fill: new Fill({
      color: COLORS.slateGray
    })
  })
})
