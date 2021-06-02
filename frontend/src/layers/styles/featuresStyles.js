import { Icon, Style } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import IconOrigin from 'ol/style/IconOrigin'
import { getTextWidth } from '../../utils'
import { COLORS } from '../../constants/constants'
import { vesselLabel as vesselLabelEnum } from '../../domain/entities/vesselLabel'
import countries from 'i18n-iso-countries'
import { VESSEL_LABEL_STYLE, vesselsAreEquals } from '../../domain/entities/vessel'

const images = require.context('../../../public/flags', false, /\.png$/)
countries.registerLocale(require('i18n-iso-countries/langs/fr.json'))

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

  console.log(vesselFileName)
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
      rotation: degreesToRadian(vessel)
    })
    : new CircleStyle({
      radius: 4,
      fill: new Fill({
        color: vesselColor
      })
    })
}

function vesselsToHighLightDoesNotContainsCurrentVessel (temporaryVesselsToHighLightOnMap, vessel) {
  return !temporaryVesselsToHighLightOnMap.some((vesselToHighLight) => {
    return vesselsAreEquals(vessel, vesselToHighLight)
  })
}

export function getVesselIconOpacity (vesselsLastPositionVisibility,
  dateTime,
  temporaryVesselsToHighLightOnMap,
  vessel) {
  const vesselDate = new Date(dateTime)

  const vesselIsHidden = new Date()
  vesselIsHidden.setHours(vesselIsHidden.getHours() - vesselsLastPositionVisibility.hidden)
  const vesselIsOpacityReduced = new Date()
  vesselIsOpacityReduced.setHours(vesselIsOpacityReduced.getHours() - vesselsLastPositionVisibility.opacityReduced)

  let opacity = 1
  if (temporaryVesselsToHighLightOnMap &&
        temporaryVesselsToHighLightOnMap.length &&
        vesselsToHighLightDoesNotContainsCurrentVessel(temporaryVesselsToHighLightOnMap, vessel)) {
    opacity = 0
  } else {
    if (vesselDate < vesselIsHidden) {
      opacity = 0
    } else if (vesselDate < vesselIsOpacityReduced) {
      opacity = 0.2
    }
  }

  return opacity
}

export const getSVG = (feature, vesselLabel) => new Promise(function (resolve) {
  const imageElement = new Image()
  const flag = images(`./${feature.getProperties().flagState.toLowerCase()}.png`)

  let showedText = ''
  switch (vesselLabel) {
    case vesselLabelEnum.VESSEL_NAME: {
      showedText = feature.getProperties().vesselName
      break
    }
    case vesselLabelEnum.VESSEL_INTERNAL_REFERENCE_NUMBER: {
      showedText = feature.getProperties().internalReferenceNumber
      break
    }
    case vesselLabelEnum.VESSEL_NATIONALITY: {
      showedText = countries.getName(feature.getProperties().flagState, 'fr')
      break
    }
    case vesselLabelEnum.VESSEL_FLEET_SEGMENT: {
      showedText = feature.getProperties().segments.join(', ')
      break
    }
  }

  const textWidth = getTextWidth(showedText) + 10 + (flag ? 18 : 0)

  const iconSVG = showedText
    ? `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="${textWidth}px" height="36px" viewBox="0 0 ${textWidth} 16"  xml:space="preserve">
            <rect x="0" y="0" width="${textWidth}px" height="16" rx="8px" fill="#FFFFFF" fill-opacity="0.7" />
            <image xlink:href="${flag}" width="14px" x="5px" height="16px"/>
            <text x="${flag ? 23 : 5}" y="13" fill="${COLORS.grayDarkerThree}" font-family="Arial" font-size="12" font-weight="normal">${showedText}</text>
        </svg>`
    : '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"/>'

  imageElement.addEventListener('load', function animationendListener () {
    imageElement.removeEventListener('load', animationendListener)
    resolve({
      imageElement: imageElement,
      showedText: showedText
    })
  }, { once: true })
  imageElement.addEventListener('error', function animationendListener () {
    imageElement.removeEventListener('error', animationendListener)
    resolve(null)
  }, { once: true })
  imageElement.src = 'data:image/svg+xml,' + escape(iconSVG)
})

export const getVesselLabelStyle = (showedText, image) =>
  new Style({
    image: new Icon({
      anchorOrigin: IconOrigin.TOP_RIGHT,
      img: image,
      imgSize: [getTextWidth(showedText) * 4 + 40, 36],
      offset: [-getTextWidth(showedText) * 2 - 30, 11],
      padding: [5, 5]
    }),
    zIndex: VESSEL_LABEL_STYLE
  })

export const setCircleStyle = (color, arrowFeature) => {
  const arrowStyle = new Style({
    image: new CircleStyle({
      radius: 3,
      fill: new Fill({
        color: color
      })
    })
  })
  arrowFeature.setStyle(arrowStyle)
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
