import { ReportingOriginActor } from '../../../../../domain/entities/reporting'
import { ReportingType } from '../../../../../domain/types/reporting'
import { getAlertNameFromType } from '../utils'

import type { Reporting } from '../../../../../domain/types/reporting'

export const getReportingOrigin = (reporting: Reporting, isHovering: boolean = false): string => {
  if (reporting.type === ReportingType.ALERT) {
    return 'Alerte auto.'
  }

  if (reporting.type === ReportingType.OBSERVATION) {
    return ''
  }

  switch (reporting.value.reportingActor) {
    case ReportingOriginActor.UNIT.code:
      return `${reporting.value.controlUnit?.name}${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    case ReportingOriginActor.OPS.code:
      return `Pôle OPS (${reporting.value.authorTrigram})`
    case ReportingOriginActor.SIP.code:
      return `Pôle SIP (${reporting.value.authorTrigram})`
    case ReportingOriginActor.DIRM.code:
      return `${reporting.value.dml}${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    case ReportingOriginActor.DML.code:
      return `${reporting.value.dml}${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    case ReportingOriginActor.OTHER.code:
      return `${reporting.value.dml}${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    default:
      return ''
  }
}

export function getReportingTitle(reporting: Reporting, isHovering: boolean = false): string {
  if (reporting.type === ReportingType.ALERT) {
    return getAlertNameFromType(reporting.value.type)
  }

  return isHovering ? `${reporting.value.title}: ${reporting.value.description}` : reporting.value.title
}
