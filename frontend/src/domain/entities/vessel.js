import Layers, { baseLayers } from './layers'
import { vesselLabel as vesselLabelEnum } from './vesselLabelLine'
import countries from 'i18n-iso-countries'

export const VESSEL_ALERT_STYLE = 1
export const VESSEL_ICON_STYLE = 10
export const VESSEL_LABEL_STYLE = 100
export const VESSEL_SELECTOR_STYLE = 200

export class Vessel {
  static vesselIsMovingSpeed = 0.1

  static getObjectForFilteringFromFeature (feature) {
    const vessel = feature.getProperties()
    return {
      olCoordinates: feature.getGeometry().getCoordinates(),
      vesselId: vessel.vesselId,
      uid: feature.ol_uid,
      length: vessel.length,
      flagState: vessel.flagState?.toLowerCase(),
      dateTimeTimestamp: new Date(vessel.dateTime).getTime(),
      gearsArray: vessel.gearOnboard ? [...new Set(vessel.gearOnboard.map(gear => gear.gear))] : [],
      fleetSegmentsArray: vessel.segments ? vessel.segments.map(segment => segment.replace(' ', '')) : [],
      speciesArray: vessel.speciesOnboard ? [...new Set(vessel.speciesOnboard.map(species => species.species))] : [],
      district: vessel.district,
      districtCode: vessel.districtCode,
      isAtPort: vessel.isAtPort,
      lastControlDateTimeTimestamp: vessel.lastControlDateTime ? new Date(vessel.lastControlDateTime).getTime() : ''
    }
  }

  static getVesselId (vessel) {
    return `${Layers.VESSELS.code}:${getVesselFeatureIdFromVessel(vessel)}`
  }

  static getVesselIdFromIdentity (identity) {
    return `${Layers.VESSELS.code}:${identity}`
  }

  static getVesselOpacity (dateTime, vesselIsHidden, vesselIsOpacityReduced) {
    const vesselDate = new Date(dateTime)

    let opacity = 1
    if (vesselDate.getTime() < vesselIsHidden.getTime()) {
      opacity = 0
    } else if (vesselDate.getTime() < vesselIsOpacityReduced.getTime()) {
      opacity = 0.2
    }

    return opacity
  }

  /**
   * Add text label to vessel feature
   * @param {Object} feature - The OpenLayers feature.getProperties() object
   * @param {{
   *   vesselLabel: string,
   *   vesselsLastPositionVisibility: Object,
   *   vesselLabelsShowedOnMap: boolean,
   *   hideVesselsAtPort: boolean,
   *   riskFactorShowedOnMap: boolean
   * }} options
   * @return {{
        labelText: string | null,
        riskFactor: {
          globalRisk: int,
          impactRiskFactor: int,
          probabilityRiskFactor: int,
          detectabilityRiskFactor: int
        } | null,
      }} - The label object
   */
  static getVesselFeatureLabel (feature, options) {
    const {
      vesselLabel,
      vesselsLastPositionVisibility,
      riskFactorShowedOnMap,
      vesselLabelsShowedOnMap,
      hideVesselsAtPort
    } = options
    const vesselDate = new Date(feature.dateTime)
    const vesselIsHidden = new Date()
    const hasBeenControlledLastFiveYears = new Date(feature.lastControlDateTime).getTime() > new Date(vesselIsHidden.getUTCFullYear() - 5, 0, 1).getTime()
    vesselIsHidden.setHours(vesselIsHidden.getHours() - vesselsLastPositionVisibility.hidden)

    const label = {
      labelText: null,
      riskFactor: null,
      underCharter: feature.underCharter
    }

    if (vesselDate.getTime() < vesselIsHidden.getTime()) {
      return label
    }

    if (hideVesselsAtPort && feature.isAtPort) {
      return label
    }

    if (vesselLabelsShowedOnMap) {
      switch (vesselLabel) {
        case vesselLabelEnum.VESSEL_NAME: {
          label.labelText = feature.vesselName
          break
        }
        case vesselLabelEnum.VESSEL_INTERNAL_REFERENCE_NUMBER: {
          label.labelText = feature.internalReferenceNumber
          break
        }
        case vesselLabelEnum.VESSEL_NATIONALITY: {
          label.labelText = feature.flagState ? countries.getName(feature.flagState, 'fr') : null
          break
        }
        case vesselLabelEnum.VESSEL_FLEET_SEGMENT: {
          label.labelText = feature.segments.join(', ')
          break
        }
        default: label.labelText = null
      }
    }

    if (riskFactorShowedOnMap) {
      label.riskFactor = {
        globalRisk: feature.riskFactor,
        impactRiskFactor: feature.impactRiskFactor,
        probabilityRiskFactor: feature.probabilityRiskFactor,
        detectabilityRiskFactor: feature.detectabilityRiskFactor,
        hasBeenControlledLastFiveYears,
        hasSegments: feature.segments?.length
      }
    }

    return label
  }

  /**
   * Check if vessel icon is in light or dark mode, based on the base layer
   * @return {boolean} isLight - returns true if vessel icon is light
   */
  static iconIsLight = selectedBaseLayer => selectedBaseLayer === baseLayers.DARK.code ||
    selectedBaseLayer === baseLayers.SATELLITE.code
}

export const getVesselIdentityFromVessel = vessel => {
  return {
    internalReferenceNumber: vessel.internalReferenceNumber,
    externalReferenceNumber: vessel.externalReferenceNumber,
    vesselName: vessel.vesselName,
    flagState: vessel.flagState,
    mmsi: vessel.mmsi,
    ircs: vessel.ircs,
    vesselIdentifier: vessel.vesselIdentifier,
    beaconNumber: vessel.beaconNumber
  }
}

export const getVesselFeatureIdFromVessel = vessel => {
  return `${vessel.internalReferenceNumber}/${vessel.externalReferenceNumber}/${vessel.ircs}`
}

export const getVesselLastPositionVisibilityDates = vesselsLastPositionVisibility => {
  const vesselIsHidden = new Date()
  vesselIsHidden.setHours(vesselIsHidden.getHours() - vesselsLastPositionVisibility.hidden)

  const vesselIsOpacityReduced = new Date()
  vesselIsOpacityReduced.setHours(vesselIsOpacityReduced.getHours() - vesselsLastPositionVisibility.opacityReduced)

  return { vesselIsHidden: vesselIsHidden, vesselIsOpacityReduced: vesselIsOpacityReduced }
}

export function vesselAndVesselFeatureAreEquals (vessel, feature) {
  return (feature.vessel.internalReferenceNumber
    ? feature.vessel.internalReferenceNumber === vessel.internalReferenceNumber
    : false) ||
    (feature.vessel.ircs
      ? feature.vessel.ircs === vessel.ircs
      : false) ||
    (feature.vessel.externalReferenceNumber
      ? feature.vessel.externalReferenceNumber === vessel.externalReferenceNumber
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

export const VesselLocation = {
  SEA: 'SEA',
  PORT: 'PORT'
}

export const TEMPORARY_VESSEL_TRACK = 'temp'

export const VesselSidebarTab = {
  SUMMARY: 1,
  IDENTITY: 2,
  VOYAGES: 3,
  CONTROLS: 4
}

export const FishingActivitiesTab = {
  SUMMARY: 1,
  MESSAGES: 2
}
