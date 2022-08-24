import { Icon, Style } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

import { COLORS } from '../../constants/constants'

const trackLineStyleCache = new Map()

export const getLineStyle = (isTimeEllipsis, trackType) => {
  const key = JSON.stringify({ color: trackType.color, isTimeEllipsis })

  if (!trackLineStyleCache.has(key)) {
    const style = new Style({
      fill: new Fill({
        color: trackType.color,
        weight: 4,
      }),
      stroke: new Stroke({
        color: isTimeEllipsis ? COLORS.slateGrayLittleOpacity : trackType.color,
        lineDash: isTimeEllipsis ? [0.1, 5] : [],
        width: 3,
      }),
    })

    trackLineStyleCache.set(key, [style])
  }

  return trackLineStyleCache.get(key)
}

export const getCircleStyle = (color, radius) => {
  const key = JSON.stringify({ color, radius })

  if (!trackLineStyleCache.has(key)) {
    const circleStyle = new Style({
      image: new CircleStyle({
        fill: new Fill({
          color,
        }),
        radius: radius || 3,
      }),
    })

    trackLineStyleCache.set(key, [circleStyle])
  }

  return trackLineStyleCache.get(key)
}

export const getArrowStyle = (trackArrow, course) => {
  const key = JSON.stringify({ course, trackArrow })

  if (!trackLineStyleCache.has(trackArrow)) {
    const arrowStyle = new Style({
      image: new Icon({
        imgSize: [15, 20],
        offset: [0, 0],
        rotation: course,
        scale: 1,
        src: trackArrow,
      }),
    })

    trackLineStyleCache.set(key, [arrowStyle])
  }

  return trackLineStyleCache.get(key)
}

export const getFishingActivityCircleStyle = () => {
  const key = 'fishingActivityCircle'

  if (!trackLineStyleCache.has(key)) {
    const circleStyle = new Style({
      image: new CircleStyle({
        fill: new Fill({
          color: COLORS.gainsboro,
        }),
        radius: 3,
        stroke: new Stroke({
          color: COLORS.charcoal,
          width: 2,
        }),
      }),
    })

    trackLineStyleCache.set(key, [circleStyle])
  }

  return trackLineStyleCache.get(key)
}
