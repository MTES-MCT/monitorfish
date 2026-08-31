import { FRENCH_COUNTRY_CODES } from '@constants/index'
import { EU_COUNTRY_CODES } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/constants'
import { MissionAction } from '@features/Mission/missionAction.types'
import { getLocalizedDayjs, pluralize } from '@mtes-mct/monitor-ui'

import type { MissionActionFormValues } from '../../types'
import type { FleetSegment } from '@features/FleetSegment/types'
import type { Option } from '@mtes-mct/monitor-ui'

export function getTitleDateFromUtcStringDate(utcStringDate: string): string {
  return getLocalizedDayjs(utcStringDate).format('D MMM à HH:mm UTC')
}

export function getFleetSegmentsAsOption(
  getFleetSegmentsApiQuery: FleetSegment[] | undefined
): Option<MissionAction.FleetSegment>[] {
  if (!getFleetSegmentsApiQuery) {
    return []
  }

  return getFleetSegmentsApiQuery.map(({ segment, segmentName }) => ({
    label: `${segment} - ${segmentName}`,
    value: {
      segment,
      segmentName: segmentName ?? undefined
    }
  }))
}

export function getNumberInFrench(aNumber: number): string {
  switch (aNumber) {
    case 1:
      return 'une'
    case 2:
      return 'deux'
    case 3:
      return 'trois'
    case 4:
      return 'quatre'
    case 5:
      return 'cinq'
    case 6:
      return 'six'
    case 7:
      return 'sept'
    case 8:
      return 'huit'
    case 9:
      return 'neuf'
    default:
      return String(aNumber)
  }
}

export type PriorityTargetReasons = {
  hasGroupOrReportingReason: boolean
  isPriorityTarget: boolean
  reasons: string[]
}

export function getPriorityTargetReasons(
  values: Pick<
    MissionActionFormValues,
    'actionType' | 'flagState' | 'isINNControl' | 'portLocode' | 'tripReportings' | 'vesselGroups'
  >
): PriorityTargetReasons {
  const priorityGroups = (values.vesselGroups ?? []).filter(group => group.isPriorityGroup)
  const currentTripReportingLength = (values.tripReportings ?? []).length
  const hasGroupOrReportingReason = priorityGroups.length > 0 || currentTripReportingLength > 0
  const isThirdCountryVesselLandingInFrance =
    values.actionType === MissionAction.MissionActionType.LAND_CONTROL &&
    FRENCH_COUNTRY_CODES.includes(values.portLocode?.slice(0, 2) ?? '') &&
    !!values.flagState &&
    values.flagState !== 'UNDEFINED' &&
    !EU_COUNTRY_CODES.includes(values.flagState)

  const reasons: string[] = []
  if (priorityGroups.length > 0) {
    const groupNames = priorityGroups.map(group => `“${group.name}”`).join(' et ')
    reasons.push(
      `il appartient au${priorityGroups.length > 1 ? 'x' : ''} ${pluralize('groupe', priorityGroups.length)} ${pluralize('prioritaire', priorityGroups.length)} ${groupNames}`
    )
  }
  if (currentTripReportingLength > 0) {
    reasons.push(
      `${getNumberInFrench(currentTripReportingLength)} ${pluralize('suspicion', currentTripReportingLength)} d’infraction est en cours sur sa marée`
    )
  }
  if (values.isINNControl) {
    reasons.push('c’est un navire INN')
  }
  if (isThirdCountryVesselLandingInFrance) {
    reasons.push('c’est un navire tiers débarquant dans un port français')
  }

  return {
    hasGroupOrReportingReason,
    isPriorityTarget: hasGroupOrReportingReason || !!values.isINNControl || isThirdCountryVesselLandingInFrance,
    reasons
  }
}

/** A flagless vessel or a vessel flying a non-EU flag — a “navire tiers ou sans pavillon”. */
export function isThirdCountryOrFlaglessVessel(flagState: string | undefined): boolean {
  return !flagState || flagState === 'UNDEFINED' || !EU_COUNTRY_CODES.includes(flagState)
}

/**
 * A UN/LOCODE is prefixed with the ISO alpha-2 code of the territory the port belongs to, so overseas
 * ports carry their own code (`RE`, `GF`...) rather than `FR`: any port but a metropolitan French one
 * is either in overseas waters or outside the French EEZ.
 */
export function isPortInInnArea(portLocode: string | undefined): boolean {
  return !!portLocode && !portLocode.startsWith('FR')
}
