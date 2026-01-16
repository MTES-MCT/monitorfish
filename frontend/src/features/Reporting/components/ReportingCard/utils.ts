import {
  type InfractionSuspicionReporting,
  type PendingAlertReporting,
  ReportingOriginActorLabel
} from '@features/Reporting/types'
import { ReportingOriginActor } from '@features/Reporting/types/ReportingOriginActor'

import type { LegacyControlUnit } from '../../../ControlUnit/legacyControlUnit'

export const getReportingActorLabel = (
  reportingActor: ReportingOriginActor,
  unit: LegacyControlUnit.LegacyControlUnit | undefined
) => {
  if (reportingActor === ReportingOriginActor.UNIT) {
    return unit?.name ?? 'Unité inconnue'
  }

  return ReportingOriginActorLabel[reportingActor]
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
