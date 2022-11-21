import countries from 'i18n-iso-countries'

import { Layer, BaseLayers } from '../layers/constants'
import { vesselLabel as vesselLabelEnum } from '../vesselLabelLine'

import type { SelectedVessel, ShowedVesselTrack, VesselIdentity } from './types'

export const VESSEL_ALERT_STYLE = 1
export const VESSEL_INFRACTION_SUSPICION_STYLE = 1
export const VESSEL_BEACON_MALFUNCTION_STYLE = 1
export const VESSEL_ALERT_AND_BEACON_MALFUNCTION = 1
export const VESSEL_ICON_STYLE = 10
export const VESSEL_LABEL_STYLE = 100
export const VESSEL_SELECTOR_STYLE = 200

export class Vessel {
  static vesselIsMovingSpeed = 0.1

  static getVesselFeatureId(vessel) {
    return `${Layer.VESSELS.code}:${getVesselId(vessel)}`
  }

  static getVesselOpacity(dateTime, vesselIsHidden, vesselIsOpacityReduced) {
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
   *   isAdmin: any
   *   vesselLabel: string
   *   vesselsLastPositionVisibility: Object
   *   vesselLabelsShowedOnMap: boolean
   *   hideVesselsAtPort: boolean
   *   riskFactorShowedOnMap: boolean
   * }} options
   * @return {{
        labelText: string | null
        riskFactor: {
          globalRisk: int
          impactRiskFactor: int
          probabilityRiskFactor: int
          detectabilityRiskFactor: int
        } | null,
      }} - The label object
   */
  static getVesselFeatureLabel(feature, options) {
    const {
      hideVesselsAtPort,
      isAdmin,
      riskFactorShowedOnMap,
      vesselLabel,
      vesselLabelsShowedOnMap,
      vesselsLastPositionVisibility
    } = options
    const vesselDate = new Date(feature.dateTime)
    const vesselIsHidden = new Date()
    const hasBeenControlledLastFiveYears =
      new Date(feature.lastControlDateTime).getTime() > new Date(vesselIsHidden.getUTCFullYear() - 5, 0, 1).getTime()
    vesselIsHidden.setHours(vesselIsHidden.getHours() - vesselsLastPositionVisibility.hidden)

    // TODO Properly type this const.
    const label: {
      labelText: string | null
      riskFactor: any | null
      underCharter: any
    } = {
      labelText: null,
      riskFactor: null,
      underCharter: feature.underCharter
    }

    if (vesselDate.getTime() < vesselIsHidden.getTime() && !feature.beaconMalfunctionId) {
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
        default:
          label.labelText = null
      }
    }

    if (isAdmin && riskFactorShowedOnMap) {
      label.riskFactor = {
        detectabilityRiskFactor: feature.detectabilityRiskFactor,
        globalRisk: feature.riskFactor,
        hasBeenControlledLastFiveYears,
        hasSegments: feature.segments?.length,
        impactRiskFactor: feature.impactRiskFactor,
        probabilityRiskFactor: feature.probabilityRiskFactor
      }
    }

    return label
  }

  /**
   * Check if vessel icon is in light or dark mode, based on the base layer
   * @return {boolean} isLight - returns true if vessel icon is light
   */
  static iconIsLight = selectedBaseLayer => selectedBaseLayer === BaseLayers.SATELLITE.code
}

// TODO <vessel> is not a Vessel. What is it?
export const getOnlyVesselIdentityProperties = (vessel: any): VesselIdentity => ({
  beaconNumber: vessel.beaconNumber,
  externalReferenceNumber: vessel.externalReferenceNumber,
  flagState: vessel.flagState,
  internalReferenceNumber: vessel.internalReferenceNumber,
  ircs: vessel.ircs,
  mmsi: vessel.mmsi,
  vesselIdentifier: vessel.vesselIdentifier,
  vesselName: vessel.vesselName
})

export const getOnlyVesselIdentityPropertiesFromSelectedVessel = (vessel: SelectedVessel): VesselIdentity => ({
  beaconNumber: vessel.beaconNumber,
  externalReferenceNumber: vessel.externalReferenceNumber,
  flagState: vessel.flagState,
  internalReferenceNumber: vessel.internalReferenceNumber,
  ircs: vessel.ircs,
  mmsi: vessel.mmsi,
  vesselId: vessel.id,
  vesselIdentifier: vessel.vesselIdentifier,
  vesselName: vessel.vesselName
})

/**
 * @param vessel
 * @return {VesselId}
 */
export const getVesselId = vessel =>
  `${vessel.internalReferenceNumber}/${vessel.externalReferenceNumber}/${vessel.ircs}`

/**
 * Returns true if there is at least one vessel track or vessel selected
 * @param {Object.<string, ShowedVesselTrack>} vesselsTracksShowed
 * @param {VesselIdentity | null} selectedVesselIdentity
 * @return {boolean}
 */
export const atLeastOneVesselSelected = (vesselsTracksShowed, selectedVesselIdentity) =>
  !!(Object.values(vesselsTracksShowed)?.length || selectedVesselIdentity)

/**
 * Returns true if the vessel is showed:
 *  - The track is displayed (`vesselsTracksShowed` param)
 *  - The vessel is selected (`selectedVesselIdentity` param)
 */
export const vesselIsShowed = (
  vesselIdentity: VesselIdentity,
  vesselsTracksShowed: ShowedVesselTrack,
  selectedVesselIdentity: VesselIdentity
): boolean =>
  vesselsAreEquals(vesselIdentity, selectedVesselIdentity) ||
  vesselsAreEquals(vesselIdentity, vesselsTracksShowed.vesselIdentity)

export const getVesselLastPositionVisibilityDates = vesselsLastPositionVisibility => {
  const vesselIsHidden = new Date()
  vesselIsHidden.setHours(vesselIsHidden.getHours() - vesselsLastPositionVisibility.hidden)

  const vesselIsOpacityReduced = new Date()
  vesselIsOpacityReduced.setHours(vesselIsOpacityReduced.getHours() - vesselsLastPositionVisibility.opacityReduced)

  return { vesselIsHidden, vesselIsOpacityReduced }
}

export function vesselAndVesselFeatureAreEquals(vessel, feature) {
  return (
    (feature.vessel.internalReferenceNumber
      ? feature.vessel.internalReferenceNumber === vessel.internalReferenceNumber
      : false) ||
    (feature.vessel.ircs ? feature.vessel.ircs === vessel.ircs : false) ||
    (feature.vessel.externalReferenceNumber
      ? feature.vessel.externalReferenceNumber === vessel.externalReferenceNumber
      : false)
  )
}

const VesselIdentifier = {
  EXTERNAL_REFERENCE_NUMBER: 'EXTERNAL_REFERENCE_NUMBER',
  INTERNAL_REFERENCE_NUMBER: 'INTERNAL_REFERENCE_NUMBER',
  IRCS: 'IRCS'
}

export function vesselsAreEquals(firstVessel, secondVessel) {
  if (!firstVessel || !secondVessel) {
    return false
  }

  switch (firstVessel?.vesselIdentifier) {
    case VesselIdentifier.INTERNAL_REFERENCE_NUMBER:
      return (
        firstVessel.internalReferenceNumber &&
        firstVessel.internalReferenceNumber === secondVessel.internalReferenceNumber
      )
    case VesselIdentifier.EXTERNAL_REFERENCE_NUMBER:
      return (
        firstVessel.externalReferenceNumber &&
        firstVessel.externalReferenceNumber === secondVessel.externalReferenceNumber
      )
    case VesselIdentifier.IRCS:
      return firstVessel.ircs && firstVessel.ircs === secondVessel.ircs

    default:
      return (
        (firstVessel.internalReferenceNumber
          ? firstVessel.internalReferenceNumber === secondVessel.internalReferenceNumber
          : false) ||
        (firstVessel.ircs ? firstVessel.ircs === secondVessel.ircs : false) ||
        (firstVessel.externalReferenceNumber
          ? firstVessel.externalReferenceNumber === secondVessel.externalReferenceNumber
          : false)
      )
  }
}

export const vesselSize = {
  ABOVE_TWELVE_METERS: {
    code: 'ABOVE_TWELVE_METERS',
    evaluate: value => value >= 12,
    text: 'Plus de 12m'
  },
  BELOW_TEN_METERS: {
    code: 'BELOW_TEN_METERS',
    evaluate: value => value < 10,
    text: 'Moins de 10m'
  },
  BELOW_TWELVE_METERS: {
    code: 'BELOW_TWELVE_METERS',
    evaluate: value => value < 12,
    text: 'Moins de 12m'
  }
}

export enum VesselLocation {
  PORT = 'PORT',
  SEA = 'SEA'
}

export const TEMPORARY_VESSEL_TRACK = 'temp'

export enum VesselSidebarTab {
  SUMMARY = 1,
  IDENTITY = 2,
  VOYAGES = 3,
  REPORTING = 4,
  CONTROLS = 5,
  ERSVMS = 6
}

export enum FishingActivitiesTab {
  SUMMARY = 1,
  MESSAGES = 2
}
