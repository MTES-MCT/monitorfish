import { getAlertNameFromType } from '../../../SideWindow/Alert/AlertListAndReportingList/utils'
import { ReportingOriginActor, ReportingType } from '../../types'

import type { Reporting } from '../../types'

export const getReportingOrigin = (reporting: Reporting, isHovering: boolean = false): string => {
  if (reporting.type === ReportingType.ALERT) {
    return 'Alerte auto.'
  }

  if (reporting.type === ReportingType.OBSERVATION) {
    return ''
  }

  switch (reporting.value.reportingActor) {
    case ReportingOriginActor.UNIT:
      return `${reporting.value.controlUnit?.name ?? ''}${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    case ReportingOriginActor.OPS:
      return `Pôle OPS (${reporting.value.authorTrigram})`
    case ReportingOriginActor.SIP:
      return `Pôle SIP (${reporting.value.authorTrigram})`
    case ReportingOriginActor.DIRM:
      return `DIRM${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    case ReportingOriginActor.DML:
      return `${reporting.value.dml}${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    case ReportingOriginActor.OTHER:
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
