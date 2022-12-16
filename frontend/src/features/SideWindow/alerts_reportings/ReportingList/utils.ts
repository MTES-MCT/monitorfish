import { ReportingOriginActor } from '../../../../domain/entities/reporting'
import { Reporting, ReportingType } from '../../../../domain/types/reporting'
import { getAlertNameFromType } from '../utils'

// TODO Improve typings logic to avoid double switch.
export const getReportingOrigin = (reporting: Reporting, isHovering: boolean = false): string => {
  if (reporting.type === ReportingType.ALERT) {
    return 'Alerte auto.'
  }

  // eslint-disable-next-line default-case
  switch (reporting.value.reportingActor) {
    case ReportingOriginActor.UNIT.code:
      return `${reporting.value.unit}${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    case ReportingOriginActor.OPS.code:
      return `Pôle OPS (${reporting.value.authorTrigram})`
    case ReportingOriginActor.SIP.code:
      return `Pôle SIP (${reporting.value.authorTrigram})`
  }

  if (reporting.type === ReportingType.OBSERVATION) {
    return ''
  }

  switch (reporting.value.reportingActor) {
    case ReportingOriginActor.UNIT.code:
      return `${reporting.value.unit}${isHovering ? `: ${reporting.value.authorContact}` : ''}`
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
