import { Icon, Style } from 'ol/style'
import { asArray } from 'ol/color'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import { Vessel, VESSEL_ICON_STYLE, VESSEL_SELECTOR_STYLE } from '../../domain/entities/vessel'

import { COLORS } from '../../constants/constants'

const iconStyleCache = new Map()
const circleStyleCache = new Map()

export const selectedVesselStyle = new Style({
  image: new Icon({
    opacity: 1,
    src: 'Selecteur_navire.png',
    scale: 0.5
  }),
  zIndex: VESSEL_SELECTOR_STYLE
})

export const getIconStyle = vesselObject => {
  const key = JSON.stringify(vesselObject)

  if (!iconStyleCache.has(key)) {
    iconStyleCache.set(key, new Style({
      image: new Icon({
        src: vesselObject.vesselFileName,
        offset: [0, 0],
        imgSize: [8, 16],
        rotation: degreesToRadian(vesselObject.course),
        // See https://github.com/openlayers/openlayers/issues/11133#issuecomment-638987210
        color: 'white',
        opacity: vesselObject.opacity
      }),
      zIndex: VESSEL_ICON_STYLE
    }))
  }

  return iconStyleCache.get(key)
}

export const getCircleStyle = vesselObject => {
  const key = JSON.stringify(vesselObject)

  if (!circleStyleCache.has(key)) {
    let color = asArray(vesselObject.vesselColor)
    color = color.slice()
    color[3] = vesselObject.opacity

    circleStyleCache.set(key, new Style({
      image: new CircleStyle({
        radius: 4,
        fill: new Fill({
          color: color
        })
      }),
      zIndex: VESSEL_ICON_STYLE
    }))
  }

  return circleStyleCache.get(key)
}

export const getVesselStyle = (feature, resolution) => {
  const filterColor = feature.get(Vessel.filterColorProperty)
  const opacity = feature.get(Vessel.opacityProperty)
  const isLight = feature.get(Vessel.isLightProperty)
  const nonFilteredVesselsAreHidden = feature.get(Vessel.nonFilteredVesselsAreHiddenProperty)
  const isShowedInFilter = feature.get(Vessel.isShowedInFilterProperty)
  const isHidden = feature.get(Vessel.isHiddenProperty)
  const isSelected = feature.get(Vessel.isSelectedProperty)
  const inPreviewMode = feature.get(Vessel.inPreviewModeProperty)
  const filterPreview = feature.get(Vessel.filterPreviewProperty)

  const course = feature.vessel.course
  const speed = feature.vessel.speed

  if (isHidden && !isSelected) {
    return []
  }

  if (nonFilteredVesselsAreHidden && filterColor && !isShowedInFilter) {
    return []
  }

  if (inPreviewMode && !filterPreview) {
    return []
  }

  const vesselFileName = getVesselFilename(filterColor, isShowedInFilter, isLight)
  const vesselColor = getVesselColor(filterColor, isShowedInFilter, isLight)

  const styles = speed > Vessel.vesselIsMovingSpeed
    ? [getIconStyle({ vesselFileName, course, opacity })]
    : [getCircleStyle({ vesselColor, opacity })]

  if (isSelected) {
    styles.push(selectedVesselStyle)
    styles[styles.length - 1].getImage().setScale(1 / Math.pow(resolution, 1 / 7))
  }

  return styles
}

function getVesselFilename (filterColor, isShowedInFilter, isLight) {
  let vesselFileName = 'icone_navire_3B4559.png'

  if (filterColor && isShowedInFilter) {
    vesselFileName = `Couleurs_filtres_navires_${filterColor.replace('#', '')}_png24.png`
  } else if (isLight) {
    vesselFileName = 'Couleur_navires_fond_sombre_cacce0_png24.png'
  }

  return vesselFileName
}

function getVesselColor (filterColor, isShowedInFilter, isLight) {
  let vesselColor = COLORS.vesselColor

  if (filterColor && isShowedInFilter) {
    vesselColor = filterColor
  } else if (isLight) {
    vesselColor = COLORS.vesselLightColor
  }

  return vesselColor
}

export function degreesToRadian (course) {
  return course * Math.PI / 180
}
