import { Icon, Style } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'

export const setCircleStyle = (color, circleFeature, radius) => {
  const circleStyle = new Style({
    image: new CircleStyle({
      radius: radius || 3,
      fill: new Fill({
        color: color
      })
    })
  })

  circleFeature.setStyle(circleStyle)
}

export const setArrowStyle = (trackArrow, arrowFeature) => {
  const arrowStyle = new Style({
    image: new Icon({
      src: trackArrow,
      offset: [0, 0],
      imgSize: [20, 34],
      scale: 0.7,
      rotation: arrowFeature.course
    })
  })

  arrowFeature.setStyle((feature, resolution) => {
    arrowStyle.getImage().setScale(1 / Math.pow(resolution, 1 / 5))
    return arrowStyle
  })
}
