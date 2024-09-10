import countries from 'i18n-iso-countries'

import { VesselLabel } from './label/types'
import { BaseLayers } from '../layers/constants'
import { MonitorFishLayer } from '../layers/types'

import type {
  SelectedVessel,
  ShowedVesselTrack,
  VesselCompositeIdentifier,
  VesselEnhancedObject,
  VesselIdentity
} from './types'
import type { LastPositionVisibility } from '../../types/map'
import type { Reporting } from '@features/Reporting/types'
import type { Vessel as VesselTypes } from '@features/Vessel/Vessel.types'

export const VESSEL_ALERT_STYLE = 1
export const VESSEL_INFRACTION_SUSPICION_STYLE = 1
export const VESSEL_BEACON_MALFUNCTION_STYLE = 1
export const VESSEL_ALERT_AND_BEACON_MALFUNCTION = 1
export const VESSEL_ICON_STYLE = 10
export const VESSEL_LABEL_STYLE = 100
export const VESSEL_SELECTOR_STYLE = 200

export class Vessel {
  static vesselIsMovingSpeed = 0.1

  static getVesselFeatureId(vessel: VesselIdentity) {
    return `${MonitorFishLayer.VESSELS}:${getVesselCompositeIdentifier(vessel)}`
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
   * @return The label object
   */
  static getVesselFeatureLabel(
    feature: VesselEnhancedObject,
    options: {
      hideVesselsAtPort: boolean
      isRiskFactorShowed: boolean
      vesselLabel: string
      vesselLabelsShowedOnMap: boolean
      vesselsLastPositionVisibility: LastPositionVisibility
    }
  ): {
    labelText: string | null
    riskFactor: {
      detectabilityRiskFactor: number
      globalRisk: number
      impactRiskFactor: number
      probabilityRiskFactor: number
    } | null
  } {
    const {
      hideVesselsAtPort,
      isRiskFactorShowed,
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
        case VesselLabel.VESSEL_NAME: {
          label.labelText = feature.vesselName
          break
        }
        case VesselLabel.VESSEL_INTERNAL_REFERENCE_NUMBER: {
          label.labelText = feature.internalReferenceNumber
          break
        }
        case VesselLabel.VESSEL_NATIONALITY: {
          label.labelText = feature.flagState ? (countries.getName(feature.flagState, 'fr') ?? null) : null
          break
        }
        case VesselLabel.VESSEL_FLEET_SEGMENT: {
          label.labelText = feature.segments.join(', ')
          break
        }
        default:
          label.labelText = null
      }
    }

    if (isRiskFactorShowed) {
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
  static iconIsLight = selectedBaseLayer =>
    selectedBaseLayer === BaseLayers.SATELLITE.code || selectedBaseLayer === BaseLayers.DARK.code
}

export const getOnlyVesselIdentityProperties = (
  vessel: VesselEnhancedObject | SelectedVessel | VesselTypes.EnrichedVessel | Reporting | VesselIdentity
): VesselIdentity => ({
  beaconNumber: 'beaconNumber' in vessel && !!vessel.beaconNumber ? vessel.beaconNumber : null,
  districtCode: 'districtCode' in vessel && !!vessel.districtCode ? vessel.districtCode : null,
  externalReferenceNumber: vessel.externalReferenceNumber ?? null,
  flagState: vessel.flagState,
  internalReferenceNumber: vessel.internalReferenceNumber ?? null,
  ircs: 'ircs' in vessel && !!vessel.ircs ? vessel.ircs : null,
  mmsi: 'mmsi' in vessel && !!vessel.mmsi ? vessel.mmsi : null,
  vesselId: 'vesselId' in vessel && !!vessel.vesselId ? vessel.vesselId : null,
  vesselIdentifier: 'vesselIdentifier' in vessel && !!vessel.vesselIdentifier ? vessel.vesselIdentifier : null,
  vesselName: vessel.vesselName ?? null
})

export const getVesselCompositeIdentifier: (vessel: VesselIdentity) => VesselCompositeIdentifier = vessel =>
  `${vessel.internalReferenceNumber ?? 'UNKNOWN'}/${vessel.ircs ?? 'UNKNOWN'}/${
    vessel.externalReferenceNumber ?? 'UNKNOWN'
  }`

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
  CONTROLS = 'CONTROLS',
  ERSVMS = 'ERSVMS',
  IDENTITY = 'IDENTITY',
  REPORTING = 'REPORTING',
  SUMMARY = 'SUMMARY',
  VOYAGES = 'VOYAGES'
}

export enum FishingActivitiesTab {
  SUMMARY = 1,
  MESSAGES = 2
}

/**
 * An unknown vessel to use when no vessel is found
 * @see https://github.com/MTES-MCT/monitorfish/pull/2045/files#diff-bcb14fe011ecfdcd40c018e16578c292cd8ba9d5bd39ad19600172865980caadR104
 */
export const UNKNOWN_VESSEL: VesselIdentity = {
  externalReferenceNumber: 'UNKNOWN',
  flagState: 'UNDEFINED',
  internalReferenceNumber: 'UNKNOWN',
  ircs: 'UNKNOWN',
  vesselId: -1,
  vesselName: 'UNKNOWN'
}
