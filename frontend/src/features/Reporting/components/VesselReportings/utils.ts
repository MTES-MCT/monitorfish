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
