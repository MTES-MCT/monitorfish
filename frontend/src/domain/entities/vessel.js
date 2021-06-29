import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from './map'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { toStringHDMS } from 'ol/coordinate'
import Layers, { baseLayers } from './layers'
import { Icon, Style } from 'ol/style'
import { getSVG, getVesselIconOpacity, getVesselImage, getVesselLabelStyle } from '../../layers/styles/featuresStyles'

export const VESSEL_ICON_STYLE = 10
export const VESSEL_LABEL_STYLE = 100
export const VESSEL_SELECTOR_STYLE = 200
const NOT_FOUND = -1

export class Vessel {
  /**
   * Vessel object for building OpenLayers vessel feature
   * @param {VesselLastPosition} vessel
   * @param {{
      id: string,
      vesselsLastPositionVisibility: Object,
      isLight: boolean,
      temporaryVesselsToHighLightOnMap: Object[]
   * }} options
   */
  constructor (vessel, options) {
    this.vessel = vessel
    this.id = options.id
    this.coordinates = transform([this.vessel.longitude, this.vessel.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

    this.feature = new Feature({
      geometry: new Point(this.coordinates),
      internalReferenceNumber: vessel.internalReferenceNumber,
      externalReferenceNumber: vessel.externalReferenceNumber,
      mmsi: vessel.mmsi,
      flagState: vessel.flagState,
      vesselName: vessel.vesselName,
      coordinates: toStringHDMS(this.coordinates),
      latitude: vessel.latitude,
      longitude: vessel.longitude,
      course: vessel.course,
      positionType: vessel.positionType,
      speed: vessel.speed,
      dateTime: vessel.dateTime,
      ircs: vessel.ircs,
      emissionPeriod: vessel.emissionPeriod,
      lastErsDateTime: vessel.lastErsDateTime,
      departureDateTime: vessel.departureDateTime,
      width: vessel.width,
      length: vessel.length,
      registryPortLocode: vessel.registryPortLocode,
      registryPortName: vessel.registryPortName,
      district: vessel.district,
      districtCode: vessel.districtCode,
      gearOnboard: vessel.gearOnboard,
      segments: vessel.segments,
      speciesOnboard: vessel.speciesOnboard,
      totalWeightOnboard: vessel.totalWeightOnboard,
      lastControlDateTime: vessel.lastControlDateTime,
      lastControlInfraction: vessel.lastControlInfraction,
      postControlComment: vessel.postControlComment

    })

    this.feature.setId(`${Layers.VESSELS.code}:${options.id}`)

    this.setVesselStyle(options)
  }

  static isSelectedVessel (vessel, selectedVesselFeatureAndIdentity) {
    return vessel &&
      selectedVesselFeatureAndIdentity &&
      selectedVesselFeatureAndIdentity.feature &&
      vesselAndVesselFeatureAreEquals(vessel, selectedVesselFeatureAndIdentity.feature)
  }

  isSelectedVessel (selectedVesselFeatureAndIdentity) {
    return Vessel.isSelectedVessel(this.vessel, selectedVesselFeatureAndIdentity)
  }

  setVesselStyle (options) {
    const styles = []

    const iconStyle = this.getIconStyle(options)
    styles.push(iconStyle)

    this.feature.setStyle(styles)
  }

  getIconStyle (options) {
    const iconStyle = new Style({
      image: getVesselImage(this.vessel, options.isLight),
      zIndex: VESSEL_ICON_STYLE
    })

    const opacity = getVesselIconOpacity(
      options.vesselsLastPositionVisibility,
      this.vessel.dateTime,
      options.temporaryVesselsToHighLightOnMap,
      this.vessel)
    iconStyle.getImage().setOpacity(opacity)

    return iconStyle
  }

  static getSelectedVesselStyle = () => new Style({
    image: new Icon({
      opacity: 1,
      src: 'select.png',
      scale: 0.4
    }),
    zIndex: VESSEL_SELECTOR_STYLE
  })

  /**
   * Apply vessels filter style to feature or apply standard style
   * @param {Object} feature - The OpenLayers feature object
   * @param {{
        filteredVesselsUids: string[],
        color: string | null,
        isLight: boolean,
        nonFilteredVesselsAreHidden: boolean,
        vesselsLastPositionVisibility: Object,
        withoutOpacity: boolean?
      }} options
   */
  static applyVesselFeatureFilterStyle (feature, options) {
    const isShowedInFilterProperty = 'isShowedInFilter'
    const featureFoundInFilteredVesselsIndex = options.filteredVesselsUids.indexOf(feature.ol_uid)

    if (featureFoundInFilteredVesselsIndex !== NOT_FOUND) {
      this.setVesselFeatureImages(feature, options)
      feature.set(isShowedInFilterProperty, true)
    } else if (options.nonFilteredVesselsAreHidden) {
      this.hideVesselFeature(feature)
      feature.set(isShowedInFilterProperty, false)
    } else {
      options.color = null
      this.setVesselFeatureImages(feature, options)
      feature.set(isShowedInFilterProperty, false)
    }
  }

  /**
   * Set vessel feature icon and label images
   * @param {Object} feature - The OpenLayers feature object
   * @param {{
        color: string?,
        isLight: boolean,
        vesselsLastPositionVisibility: Object,
        withoutOpacity: boolean?
      }} options
   */
  static setVesselFeatureImages (feature, options) {
    const vesselIconStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)

    if (vesselIconStyle) {
      const vesselImage = getVesselImage({
        speed: feature.getProperties().speed,
        course: feature.getProperties().course
      }, options.isLight, options.color)

      vesselIconStyle.setImage(vesselImage)
      if (!options.withoutOpacity) {
        const opacity = getVesselIconOpacity(options.vesselsLastPositionVisibility, feature.getProperties().dateTime)
        vesselIconStyle.getImage().setOpacity(opacity)
      }
    }

    const vesselLabelStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_LABEL_STYLE)
    if (vesselLabelStyle) {
      vesselLabelStyle.getImage().setOpacity(1)
    }
  }

  /**
   * Hide vessel feature icon, selector and label images
   * @param {Object} feature - The OpenLayers feature object
   */
  static hideVesselFeature (feature) {
    const vesselIconStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
    if (vesselIconStyle) {
      vesselIconStyle.getImage().setOpacity(0)
    }

    const vesselLabelStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_LABEL_STYLE)
    if (vesselLabelStyle) {
      vesselLabelStyle.getImage().setOpacity(0)
    }

    const vesselSelectorStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_SELECTOR_STYLE)
    if (vesselSelectorStyle) {
      vesselSelectorStyle.getImage().setOpacity(0)
    }
  }

  /**
   * Add text label to vessel feature
   * @param {Object} feature - The OpenLayers feature object
   * @param {string} vesselLabelTypeEnum
   * @param {Object} vesselsLastPositionVisibility
   */
  static addLabelToVesselFeature (feature, vesselLabelTypeEnum, vesselsLastPositionVisibility) {
    const vesselDate = new Date(feature.getProperties().dateTime)
    const vesselIsHidden = new Date()
    vesselIsHidden.setHours(vesselIsHidden.getHours() - vesselsLastPositionVisibility.hidden)

    if (vesselDate > vesselIsHidden) {
      getSVG(feature, vesselLabelTypeEnum).then(svg => {
        if (svg) {
          const style = getVesselLabelStyle(svg.showedText, svg.imageElement)

          const vesselLabelStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_LABEL_STYLE)
          if (!vesselLabelStyle || vesselLabelStyle.getImage() !== svg.imageElement) {
            const stylesWithoutVesselName = feature.getStyle().filter(style => style.zIndex_ !== VESSEL_LABEL_STYLE)

            feature.setStyle([...stylesWithoutVesselName, style])
          }
        }
      })
    }
  }

  /**
   * Remove text label to vessel feature
   * @param {Object} feature - The OpenLayers feature object
   */
  static removeLabelToVesselFeature (feature) {
    const stylesWithoutVesselName = feature.getStyle().filter(style => style.zIndex_ !== VESSEL_LABEL_STYLE)
    feature.setStyle([...stylesWithoutVesselName])
  }

  /**
   * Check if vessel icon is in light or dark mode, based on the base layer
   * @return {boolean} isLight - returns true if vessel icon is light
   */
  static iconIsLight = selectedBaseLayer => selectedBaseLayer === baseLayers.DARK.code ||
    selectedBaseLayer === baseLayers.SATELLITE.code

  static setVesselAsSelected (feature) {
    const styles = feature.getStyle()
    const vesselAlreadyWithSelectorStyle = styles.find(style => style.zIndex_ === VESSEL_SELECTOR_STYLE)
    if (!vesselAlreadyWithSelectorStyle) {
      feature.setStyle([...styles, Vessel.getSelectedVesselStyle()])
    }

    return feature
  }
}

export const getVesselIdentityFromFeature = feature => {
  return {
    internalReferenceNumber: feature.getProperties().internalReferenceNumber,
    externalReferenceNumber: feature.getProperties().externalReferenceNumber,
    vesselName: feature.getProperties().vesselName,
    flagState: feature.getProperties().flagState,
    mmsi: feature.getProperties().mmsi,
    ircs: feature.getProperties().ircs
  }
}

export const getVesselIdentityFromVessel = vessel => {
  return {
    internalReferenceNumber: vessel.internalReferenceNumber,
    externalReferenceNumber: vessel.externalReferenceNumber,
    vesselName: vessel.vesselName,
    flagState: vessel.flagState,
    mmsi: vessel.mmsi,
    ircs: vessel.ircs
  }
}

export const getVesselFeatureAndIdentity = (feature, identity) => {
  return {
    identity: identity,
    feature: feature
  }
}

export function vesselAndVesselFeatureAreEquals (vessel, feature) {
  return (feature.getProperties().internalReferenceNumber
    ? feature.getProperties().internalReferenceNumber === vessel.internalReferenceNumber
    : false) ||
    (feature.getProperties().ircs
      ? feature.getProperties().ircs === vessel.ircs
      : false) ||
    (feature.getProperties().externalReferenceNumber
      ? feature.getProperties().externalReferenceNumber === vessel.externalReferenceNumber
      : false)
}

export function vesselsAreEquals (firstVessel, secondVessel) {
  if (!firstVessel || !secondVessel) {
    return false
  }

  return (firstVessel.internalReferenceNumber
    ? firstVessel.internalReferenceNumber === secondVessel.internalReferenceNumber
    : false) ||
    (firstVessel.ircs
      ? firstVessel.ircs === secondVessel.ircs
      : false) ||
    (firstVessel.externalReferenceNumber
      ? firstVessel.externalReferenceNumber === secondVessel.externalReferenceNumber
      : false)
}

export const vesselSize = {
  BELOW_TEN_METERS: {
    code: 'BELOW_TEN_METERS',
    text: 'Moins de 10m',
    evaluate: value => value < 10
  },
  BELOW_TWELVE_METERS: {
    code: 'BELOW_TWELVE_METERS',
    text: 'Moins de 12m',
    evaluate: value => value < 12
  },
  ABOVE_TWELVE_METERS: {
    code: 'ABOVE_TWELVE_METERS',
    text: 'Plus de 12m',
    evaluate: value => value >= 12
  }
}

export const TEMPORARY_VESSEL_TRACK = 'temp'
