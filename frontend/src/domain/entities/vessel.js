import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from './map'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { toStringHDMS } from 'ol/coordinate'
import Layers from './layers'
import { Icon, Style } from 'ol/style'
import {
  getSVG,
  getVesselIconOpacity,
  getVesselImage, getVesselLabelStyle
} from '../../layers/styles/featuresStyles'

export const VESSEL_ICON_STYLE = 10
export const VESSEL_LABEL_STYLE = 100
export const VESSEL_SELECTOR_STYLE = 200
const NOT_FOUND = -1

export class Vessel {
  /**
   * Vessel object for building OpenLayers vessel feature
   * @param {Vessel | VesselLastPosition} vessel
   * @param {PositionWithTransformedCoordinates} position
   * @param {string} id
   */
  constructor (vessel, position, id) {
    this.vessel = vessel
    this.id = id
    this.coordinates = position.coordinates
    this.position = position

    this.feature = new Feature({
      geometry: new Point(position.coordinates),
      internalReferenceNumber: vessel.internalReferenceNumber,
      externalReferenceNumber: vessel.externalReferenceNumber,
      mmsi: vessel.mmsi,
      flagState: vessel.flagState,
      vesselName: vessel.vesselName,
      coordinates: toStringHDMS(position.coordinates),
      course: position.course,
      positionType: position.positionType,
      speed: position.speed,
      dateTime: position.dateTime,
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
      totalWeightOnboard: vessel.totalWeightOnboard
    })

    this.feature.setId(`${Layers.VESSELS.code}:${id}`)
  }

  /**
   * Get vessel position from either the VesselLastPosition or Vessel objects
   * @param {Vessel | VesselLastPosition} currentVessel
   * @param {{
        identity: Object,
        feature: Object
      }} selectedVesselFeatureAndIdentity
   * @param {Vessel} selectedVessel
   * @returns {PositionWithTransformedCoordinates} The position
   */
  static getPosition (currentVessel, selectedVesselFeatureAndIdentity, selectedVessel) {
    let position = {}

    if (this.isVesselLastPosition(currentVessel)) {
      position = Vessel.getPositionObject(currentVessel)
    } else if (this.isVesselTrack(currentVessel)) {
      const lastPosition = currentVessel.positions[currentVessel.positions.length - 1]

      position = Vessel.getPositionObject(lastPosition)
    }

    if (this.isSelectedVessel(currentVessel, selectedVesselFeatureAndIdentity) && this.isVesselTrack(currentVessel) && selectedVessel) {
      const lastPosition = selectedVessel.positions[selectedVessel.positions.length - 1]

      position = Vessel.getPositionObject(lastPosition)
    }

    return position
  }

  static isVesselTrack (currentVessel) {
    return currentVessel.positions && currentVessel.positions.length
  }

  static isVesselLastPosition (currentVessel) {
    return currentVessel.longitude && currentVessel.latitude
  }

  /**
   * @typedef PositionWithTransformedCoordinates
   * @property {string[]} coordinates
   * @property {number} course
   * @property {string} positionType
   * @property {number} speed
   * @property {string} dateTime
   */

  /**
   * Get vessel position object
   * @returns {PositionWithTransformedCoordinates} The position
   */
  static getPositionObject (position) {
    let transformedCoordinates = []
    if (position && position.longitude && position.latitude) {
      transformedCoordinates = transform([position.longitude, position.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    }

    return {
      coordinates: transformedCoordinates,
      course: position.course,
      positionType: position.positionType,
      speed: position.speed,
      dateTime: position.dateTime
    }
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
      image: getVesselImage(this.position, options.isLight),
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

  static applyVesselFeatureFilterStyle (feature, filteredVesselsUids, color, isLight, nonFilteredVesselsAreHidden, vesselsLastPositionVisibility) {
    const vesselIconStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)

    const isShowedInFilterProperty = 'isShowedInFilter'
    if (vesselIconStyle) {
      const featureFoundInFilteredVesselsIndex = filteredVesselsUids.indexOf(feature.ol_uid)

      if (featureFoundInFilteredVesselsIndex !== NOT_FOUND) {
        this.setVesselFeatureImages(feature, color, isLight, vesselIconStyle, vesselsLastPositionVisibility)
        feature.set(isShowedInFilterProperty, true)
      } else if (nonFilteredVesselsAreHidden) {
        this.hideVesselFeatureImages(feature, vesselIconStyle)
        feature.set(isShowedInFilterProperty, false)
      } else {
        this.setVesselFeatureImages(feature, null, isLight, vesselIconStyle, vesselsLastPositionVisibility)
        feature.set(isShowedInFilterProperty, false)
      }
    }
  }

  static setVesselFeatureImages (feature, color, isLight, vesselIconStyle, withoutOpacity, vesselsLastPositionVisibility) {
    const vesselImage = getVesselImage({
      speed: feature.getProperties().speed,
      course: feature.getProperties().course
    }, isLight, color)

    vesselIconStyle.setImage(vesselImage)
    if(!withoutOpacity) {
      const opacity = getVesselIconOpacity(vesselsLastPositionVisibility, feature.getProperties().dateTime)
      vesselIconStyle.getImage().setOpacity(opacity)
    }

    const vesselLabelStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_LABEL_STYLE)
    if (vesselLabelStyle) {
      vesselLabelStyle.getImage().setOpacity(1)
    }
  }

  static hideVesselFeatureImages (feature, vesselIconStyle) {
    const vesselLabelStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_LABEL_STYLE)
    if (vesselLabelStyle) {
      vesselLabelStyle.getImage().setOpacity(0)
    }

    vesselIconStyle.getImage().setOpacity(0)
  }

  static hideVesselFeature (featureToHide) {
    const vesselIconStyle = featureToHide.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
    if (vesselIconStyle) {
      vesselIconStyle.getImage().setOpacity(0)
    }
    const vesselLabelStyle = featureToHide.getStyle().find(style => style.zIndex_ === VESSEL_LABEL_STYLE)
    if (vesselLabelStyle) {
      vesselLabelStyle.getImage().setOpacity(0)
    }
  }

  static addVesselLabelToFeature (feature, vesselLabel, vesselsLastPositionVisibility) {
    const vesselDate = new Date(feature.getProperties().dateTime)
    const vesselIsHidden = new Date()
    vesselIsHidden.setHours(vesselIsHidden.getHours() - vesselsLastPositionVisibility.hidden)

    if (vesselDate > vesselIsHidden) {
      getSVG(feature, vesselLabel).then(svg => {
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

  static removeVesselLabelToFeature(feature) {
    const stylesWithoutVesselName = feature.getStyle().filter(style => style.zIndex_ !== VESSEL_LABEL_STYLE)
    feature.setStyle([...stylesWithoutVesselName])
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
