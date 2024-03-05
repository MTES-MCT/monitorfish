import { ReportingOriginActor } from '@features/Reporting/types'

import type { LegacyControlUnit } from '../../../../domain/types/legacyControlUnit'

export const getReportingActor = (
  reportingActor: keyof typeof ReportingOriginActor,
  unit: LegacyControlUnit.LegacyControlUnit | undefined
) => {
  if (reportingActor === ReportingOriginActor.UNIT.code) {
    return unit?.name ?? 'Unité inconnue'
  }

  return ReportingOriginActor[reportingActor].name
}
