import { Icon, Style } from 'ol/style'
import { asArray } from 'ol/color'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import { VESSEL_ICON_STYLE, VESSEL_SELECTOR_STYLE } from '../../domain/entities/vessel'

// A javascript object literal can be used to cache previously created styles.
const iconStyleCache = new WeakMap()
const circleStyleCache = new WeakMap()

export const selectedVesselStyle = new Style({
  image: new Icon({
    opacity: 1,
    src: 'select.png',
    scale: 0.4
  }),
  zIndex: VESSEL_SELECTOR_STYLE
})

export const getIconStyle = object => {
  if (!iconStyleCache.has(object)) {
    iconStyleCache.set(object, new Style({
      image: new Icon({
        src: object.vesselFileName,
        offset: [0, 0],
        imgSize: [8, 16],
        rotation: degreesToRadian(object.course),
        // See https://github.com/openlayers/openlayers/issues/11133#issuecomment-638987210
        color: 'white',
        opacity: object.opacity
      }),
      zIndex: VESSEL_ICON_STYLE
    }))
  }

  return iconStyleCache.get(object)
}

export const getCircleStyle = object => {
  if (!circleStyleCache.has(object)) {
    let color = asArray(object.vesselColor)
    color = color.slice()
    color[3] = object.opacity

    circleStyleCache.set(object, new Style({
      image: new CircleStyle({
        radius: 4,
        fill: new Fill({
          color: color
        })
      }),
      zIndex: VESSEL_ICON_STYLE
    }))
  }

  return circleStyleCache.get(object)
}

export const getVesselStyle = feature => {
  const {
    filterColor,
    opacity,
    isLight,
    course,
    speed,
    nonFilteredVesselsAreHidden,
    isShowedInFilter
  } = feature.getProperties()

  if (nonFilteredVesselsAreHidden && filterColor && !isShowedInFilter) {
    return []
  }

  let vesselFileName = 'Couleur_navires_fond_clair_05065f_png24.png'
  if (filterColor && isShowedInFilter) {
    vesselFileName = `Couleurs_filtres_navires_${filterColor.replace('#', '')}_png24.png`
  } else if (isLight) {
    vesselFileName = 'Couleur_navires_fond_sombre_cacce0_png24.png'
  }

  let vesselColor = 'rgb(5, 5, 94)'
  if (filterColor && isShowedInFilter) {
    vesselColor = filterColor
  } else if (isLight) {
    vesselColor = '#cacce0'
  }

  const style = speed > 0.1
    ? getIconStyle({ vesselFileName, course, opacity })
    : getCircleStyle({ vesselColor, opacity })

  const styles = [style]

  if (feature.getProperties().isSelected) {
    styles.push(selectedVesselStyle)
  }

  return styles
}

export function degreesToRadian (course) {
  return course * Math.PI / 180
}
