import { BaseLayer } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { VesselLabel } from '@features/Vessel/label.types'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import countries from 'i18n-iso-countries'

import type { PartialExcept } from '../../../types'
import type { ShowedVesselTrack } from '@features/Vessel/types/types'
import type { Vessel } from '@features/Vessel/Vessel.types'

export const VESSEL_ALERT_STYLE = 1
export const VESSEL_INFRACTION_SUSPICION_STYLE = 1
export const VESSEL_BEACON_MALFUNCTION_STYLE = 1
export const VESSEL_ALERT_AND_BEACON_MALFUNCTION = 1
export const VESSEL_SELECTOR_STYLE = 200

export class VesselFeature {
  static vesselIsMovingSpeed = 0.1

  static getVesselFeatureId(vessel) {
    return `${MonitorFishMap.MonitorFishLayer.VESSELS}:${getVesselCompositeIdentifier(vessel)}`
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
    feature: PartialExcept<
      Vessel.VesselLastPosition,
      | 'beaconMalfunctionId'
      | 'dateTime'
      | 'detectabilityRiskFactor'
      | 'flagState'
      | 'impactRiskFactor'
      | 'internalReferenceNumber'
      | 'isAtPort'
      | 'lastControlDateTime'
      | 'probabilityRiskFactor'
      | 'riskFactor'
      | 'segments'
      | 'underCharter'
      | 'vesselId'
      | 'vesselIdentifier'
      | 'vesselName'
    >,
    options: {
      hideVesselsAtPort: boolean
      isRiskFactorShowed: boolean
      vesselLabel: string
      vesselLabelsShowedOnMap: boolean
      vesselsLastPositionVisibility: MonitorFishMap.LastPositionVisibility
    }
  ): {
    labelText: string | undefined
    riskFactor:
      | {
          detectabilityRiskFactor: number
          globalRisk: number
          impactRiskFactor: number
          probabilityRiskFactor: number
        }
      | undefined
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
    const hasBeenControlledLastFiveYears = feature.lastControlDateTime
      ? new Date(feature.lastControlDateTime).getTime() > new Date(vesselIsHidden.getUTCFullYear() - 5, 0, 1).getTime()
      : false
    vesselIsHidden.setHours(vesselIsHidden.getHours() - vesselsLastPositionVisibility.hidden)

    // TODO Properly type this const.
    const label: {
      labelText: string | undefined
      riskFactor: any | undefined
      underCharter: any
    } = {
      labelText: undefined,
      riskFactor: undefined,
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
          label.labelText = feature.flagState ? (countries.getName(feature.flagState, 'fr') ?? undefined) : undefined
          break
        }
        case VesselLabel.VESSEL_FLEET_SEGMENT: {
          label.labelText = feature.segments.join(', ')
          break
        }
        default:
          label.labelText = undefined
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
    selectedBaseLayer === BaseLayer.SATELLITE.code || selectedBaseLayer === BaseLayer.DARK.code
}

/**
 * Returns true if there is at least one vessel track or vessel selected
 * @param {Object.<string, ShowedVesselTrack>} vesselsTracksShowed
 * @param {Vessel.VesselIdentity | null} selectedVesselIdentity
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
  vesselIdentity: Vessel.VesselIdentity,
  vesselsTrackShowed: ShowedVesselTrack | undefined,
  selectedVesselIdentity: Vessel.VesselIdentity
): boolean =>
  vesselsAreEquals(vesselIdentity, selectedVesselIdentity) ||
  vesselsAreEquals(vesselIdentity, vesselsTrackShowed?.vesselIdentity)

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
export const UNKNOWN_VESSEL: Vessel.VesselIdentity = {
  beaconNumber: undefined,
  districtCode: undefined,
  externalReferenceNumber: 'UNKNOWN',
  flagState: 'UNDEFINED',
  internalReferenceNumber: 'UNKNOWN',
  ircs: 'UNKNOWN',
  mmsi: undefined,
  vesselId: -1,
  vesselIdentifier: undefined,
  vesselLength: undefined,
  vesselName: 'UNKNOWN'
}
