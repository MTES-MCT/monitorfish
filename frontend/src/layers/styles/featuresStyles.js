import { Icon, Style } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'

function degreesToRadian (vessel) {
  return vessel.course * Math.PI / 180
}

export function getVesselImage (vessel, isLight, color) {
  let vesselFileName = 'Couleur_navires_fond_clair_05065f_png24.png'
  if (color) {
    vesselFileName = `Couleurs_filtres_navires_${color.replace('#', '')}_png24.png`
  } else if (isLight) {
    vesselFileName = 'Couleur_navires_fond_sombre_cacce0_png24.png'
  }

  let vesselColor = 'rgb(5, 5, 94)'
  if (color) {
    vesselColor = color
  } else if (isLight) {
    vesselColor = '#cacce0'
  }

  return vessel.speed > 0.1
    ? new Icon({
      src: vesselFileName,
      offset: [0, 0],
      imgSize: [8, 16],
      rotation: degreesToRadian(vessel),
      // See https://github.com/openlayers/openlayers/issues/11133#issuecomment-638987210
      color: 'white'
    })
    : new CircleStyle({
      radius: 4,
      fill: new Fill({
        color: vesselColor
      })
    })
}

export function getVesselIconOpacity (vesselsLastPositionVisibility, dateTime) {
  const vesselDate = new Date(dateTime)

  const vesselIsHidden = new Date()
  vesselIsHidden.setHours(vesselIsHidden.getHours() - vesselsLastPositionVisibility.hidden)
  const vesselIsOpacityReduced = new Date()
  vesselIsOpacityReduced.setHours(vesselIsOpacityReduced.getHours() - vesselsLastPositionVisibility.opacityReduced)

  let opacity = 1
  if (vesselDate < vesselIsHidden) {
    opacity = 0
  } else if (vesselDate < vesselIsOpacityReduced) {
    opacity = 0.2
  }

  return opacity
}

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
      rotation: arrowFeature.getProperties().course
    })
  })

  arrowFeature.setStyle((feature, resolution) => {
    arrowStyle.getImage().setScale(1 / Math.pow(resolution, 1 / 5))
    return arrowStyle
  })
}
