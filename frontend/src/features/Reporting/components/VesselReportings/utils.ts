import { ReportingOriginActor } from '@features/Reporting/types'

import type { LegacyControlUnit } from '../../../../domain/types/legacyControlUnit'

export const getReportingActor = (reportingActor, unit: LegacyControlUnit.LegacyControlUnit | null) => {
  switch (reportingActor) {
    case ReportingOriginActor.UNIT.code:
      return unit?.name ?? 'Unité inconnue'
    default:
      return ReportingOriginActor[reportingActor].name
  }
}
