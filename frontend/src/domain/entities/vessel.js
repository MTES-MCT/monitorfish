import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from './map'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { toStringHDMS } from 'ol/coordinate'
import Layers, { baseLayers } from './layers'
import { vesselLabel as vesselLabelEnum } from './vesselLabelLine'
import countries from 'i18n-iso-countries'

export const VESSEL_ICON_STYLE = 10
export const VESSEL_LABEL_STYLE = 100
export const VESSEL_SELECTOR_STYLE = 200

export const IS_LIGHT_PROPERTY = 'isLight'
export const NON_FILTERED_VESSELS_ARE_HIDDEN_PROPERTY = 'nonFilteredVesselsAreHidden'
export const OPACITY_PROPERTY = 'opacity'
export const FILTER_COLOR_PROPERTY = 'filterColor'
export const IS_SELECTED_PROPERTY = 'isSelected'
export const IS_SHOWED_IN_FILTER_PROPERTY = 'isShowedInFilter'

const NOT_FOUND = -1

export class Vessel {
  /**
   * Vessel object for building OpenLayers vessel feature
   * @param {VesselLastPosition} vessel
   */
  constructor (vessel) {
    this.vessel = vessel
    this.id = Vessel.getVesselId(vessel)
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
      estimatedCurrentLatitude: vessel.estimatedCurrentLatitude,
      estimatedCurrentLongitude: vessel.estimatedCurrentLongitude,
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
      postControlComment: vessel.postControlComment,
      vesselIdentifier: vessel.vesselIdentifier
    })

    this.feature.setId(this.id)
  }

  static vesselIsMovingSpeed = 0.1

  /**
   * Apply filter property to vessel feature
   * @param {Object} feature - The OpenLayers feature object
   * @param filteredVesselsUids: string[] - the filtered vessels list
   */
  static applyIsShowedPropertyToVessels (feature, filteredVesselsUids) {
    const featureFoundInFilteredVesselsIndex = filteredVesselsUids.indexOf(feature.ol_uid)

    feature.set(IS_SHOWED_IN_FILTER_PROPERTY, featureFoundInFilteredVesselsIndex !== NOT_FOUND)
  }

  static getVesselId (vessel) {
    return `${Layers.VESSELS.code}:${getVesselFeatureIdFromVessel(vessel)}`
  }

  static getVesselOpacity (vesselsLastPositionVisibility, dateTime) {
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

  /**
   * Add text label to vessel feature
   * @param {Object} feature - The OpenLayers feature object
   * @param {string} vesselLabelTypeEnum
   * @param {Object} vesselsLastPositionVisibility
   */
  static getVesselFeatureLabel (feature, vesselLabelTypeEnum, vesselsLastPositionVisibility) {
    const vesselDate = new Date(feature.getProperties().dateTime)
    const vesselIsHidden = new Date()
    vesselIsHidden.setHours(vesselIsHidden.getHours() - vesselsLastPositionVisibility.hidden)

    if (vesselDate > vesselIsHidden) {
      switch (vesselLabelTypeEnum) {
        case vesselLabelEnum.VESSEL_NAME: {
          return feature.getProperties().vesselName
        }
        case vesselLabelEnum.VESSEL_INTERNAL_REFERENCE_NUMBER: {
          return feature.getProperties().internalReferenceNumber
        }
        case vesselLabelEnum.VESSEL_NATIONALITY: {
          return countries.getName(feature.getProperties().flagState, 'fr')
        }
        case vesselLabelEnum.VESSEL_FLEET_SEGMENT: {
          return feature.getProperties().segments.join(', ')
        }
        default: return null
      }
    }

    return null
  }

  /**
   * Check if vessel icon is in light or dark mode, based on the base layer
   * @return {boolean} isLight - returns true if vessel icon is light
   */
  static iconIsLight = selectedBaseLayer => selectedBaseLayer === baseLayers.DARK.code ||
    selectedBaseLayer === baseLayers.SATELLITE.code
}

export const getVesselIdentityFromFeature = feature => {
  return {
    internalReferenceNumber: feature.getProperties().internalReferenceNumber,
    externalReferenceNumber: feature.getProperties().externalReferenceNumber,
    latitude: feature.getProperties().latitude,
    longitude: feature.getProperties().longitude,
    vesselName: feature.getProperties().vesselName,
    flagState: feature.getProperties().flagState,
    mmsi: feature.getProperties().mmsi,
    ircs: feature.getProperties().ircs,
    course: feature.getProperties().course,
    speed: feature.getProperties().speed,
    width: feature.getProperties().width,
    length: feature.getProperties().length,
    dateTime: feature.getProperties().dateTime,
    gearOnboard: feature.getProperties().gearOnboard,
    segments: feature.getProperties().segments,
    speciesOnboard: feature.getProperties().speciesOnboard,
    district: feature.getProperties().district,
    districtCode: feature.getProperties().districtCode,
    lastControlDateTime: feature.getProperties().lastControlDateTime,
    lastControlInfraction: feature.getProperties().lastControlInfraction,
    totalWeightOnboard: feature.getProperties().totalWeightOnboard,
    registryPortLocode: feature.getProperties().registryPortLocode,
    registryPortName: feature.getProperties().registryPortName,
    lastErsDateTime: feature.getProperties().lastErsDateTime,
    emissionPeriod: feature.getProperties().emissionPeriod,
    departureDateTime: feature.getProperties().departureDateTime
  }
}

export const getVesselIdentityFromVessel = vessel => {
  return {
    internalReferenceNumber: vessel.internalReferenceNumber,
    externalReferenceNumber: vessel.externalReferenceNumber,
    vesselName: vessel.vesselName,
    flagState: vessel.flagState,
    mmsi: vessel.mmsi,
    ircs: vessel.ircs,
    vesselIdentifier: vessel.vesselIdentifier
  }
}

export const getVesselFeatureIdFromVessel = vessel => {
  return `${vessel.internalReferenceNumber}/${vessel.externalReferenceNumber}/${vessel.mmsi}/${vessel.ircs}`
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

export const VesselSidebarTab = {
  SUMMARY: 1,
  IDENTITY: 2,
  VOYAGES: 3,
  CONTROLS: 4
}
