import {
  type InfractionSuspicionReporting,
  type InfractionSuspicionThreat,
  type PendingAlertReporting,
  ReportingOriginSourceLabel
} from '@features/Reporting/types'
import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { ReportingType } from '@features/Reporting/types/ReportingType'

import type { LegacyControlUnit } from '../../../ControlUnit/legacyControlUnit'

export const getReportingActorLabel = (
  reportingSource: ReportingOriginSource | undefined,
  unit: LegacyControlUnit.LegacyControlUnit | undefined
) => {
  if (reportingSource === ReportingOriginSource.UNIT) {
    return unit?.name ?? 'Unité inconnue'
  }

  if (!reportingSource) {
    return ''
  }

  return ReportingOriginSourceLabel[reportingSource]
}

export function getFrenchOrdinal(index: number): string {
  if (index === 0) {
    return '1ère'
  }

  return `${index + 1}è`
}

export const getInfractionSuspicionThreatTitle = (infraction: InfractionSuspicionThreat): string =>
  `${infraction.threat} - ${infraction.threatCharacterization}\n${infraction.natinfCode}${infraction.infraction ? ` - ${infraction.infraction.infraction}` : ''}`

export const getInfractionTitle = (reporting: InfractionSuspicionReporting | PendingAlertReporting): string => {
  if (reporting.type === ReportingType.INFRACTION_SUSPICION) {
    return reporting.value.infractions.map(getInfractionSuspicionThreatTitle).join('\n\n')
  }

  return `${reporting.value.threat} - ${reporting.value.threatCharacterization}\n${reporting.value.natinfCode} - ${reporting.infraction?.infraction}`
}
