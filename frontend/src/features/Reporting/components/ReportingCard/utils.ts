import { ReportingOriginActor, ReportingOriginActorLabel } from '@features/Reporting/types'

import type { LegacyControlUnit } from '../../../../domain/types/legacyControlUnit'

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
