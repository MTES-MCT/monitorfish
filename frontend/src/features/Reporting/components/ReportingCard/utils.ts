import {
  type InfractionSuspicionReporting,
  type PendingAlertReporting,
  ReportingOriginSourceLabel
} from '@features/Reporting/types'
import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'

import type { LegacyControlUnit } from '../../../ControlUnit/legacyControlUnit'

export const getReportingActorLabel = (
  reportingActor: ReportingOriginSource,
  unit: LegacyControlUnit.LegacyControlUnit | undefined
) => {
  if (reportingActor === ReportingOriginSource.UNIT) {
    return unit?.name ?? 'Unité inconnue'
  }

  return ReportingOriginSourceLabel[reportingActor]
}

export function getFrenchOrdinal(index: number): string {
  if (index === 0) {
    return '1ère'
  }

  return `${index + 1}è`
}

export const getInfractionTitle = (
  reporting: InfractionSuspicionReporting | PendingAlertReporting
): string => `${reporting.value.threat} - ${reporting.value.threatCharacterization}
${reporting.value.natinfCode} - ${reporting.infraction?.infraction}`
