import { Icon, Style } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import { COLORS } from '../../constants/constants'

const trackLineStyleCache = new Map()

export const getLineStyle = (isTimeEllipsis, trackType) => {
  if (!trackLineStyleCache.has(isTimeEllipsis)) {
    const style = new Style({
      fill: new Fill({
        color: trackType.color,
        weight: 4
      }),
      stroke: new Stroke({
        color: isTimeEllipsis ? COLORS.slateGrayLittleOpacity : trackType.color,
        width: 3,
        lineDash: isTimeEllipsis ? [0.1, 5] : []
      })
    })

    trackLineStyleCache.set(isTimeEllipsis, [style])
  }

  return trackLineStyleCache.get(isTimeEllipsis)
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
        imgSize: [20, 34],
        scale: 0.7,
        rotation: course
      })
    })

    trackLineStyleCache.set(key, [arrowStyle])
  }

  return trackLineStyleCache.get(key)
}
