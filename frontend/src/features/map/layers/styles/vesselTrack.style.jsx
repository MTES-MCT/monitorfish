import { Icon, Style } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import { COLORS } from '../../../../constants/constants'
import { theme } from '../../../../ui/theme'

const trackLineStyleCache = new Map()

export const getLineStyle = (isTimeEllipsis, trackType) => {
  const key = JSON.stringify({ isTimeEllipsis, color: trackType.color })

  if (!trackLineStyleCache.has(key)) {
    const style = new Style({
      fill: new Fill({
        color: trackType.color,
        weight: 4
      }),
      stroke: new Stroke({
        color: isTimeEllipsis ? theme.color.charcoalShadow : trackType.color,
        width: 3,
        lineDash: isTimeEllipsis ? [0.1, 5] : []
      })
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
        radius: radius || 3,
        fill: new Fill({
          color: color
        })
      })
    })

    trackLineStyleCache.set(key, [circleStyle])
  }

  return trackLineStyleCache.get(key)
}

export const getArrowStyle = (trackArrow, course) => {
  const key = JSON.stringify({ trackArrow, course })

  if (!trackLineStyleCache.has(trackArrow)) {
    const arrowStyle = new Style({
      image: new Icon({
        src: trackArrow,
        offset: [0, 0],
        imgSize: [15, 20],
        scale: 1,
        rotation: course
      })
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
        radius: 3,
        fill: new Fill({
          color: COLORS.gainsboro
        }),
        stroke: new Stroke({
          color: COLORS.charcoal,
          width: 2
        })
      })
    })

    trackLineStyleCache.set(key, [circleStyle])
  }

  return trackLineStyleCache.get(key)
}
