import { getAlertNameFromType } from '@features/Alert/components/SideWindowAlerts/AlertListAndReportingList/utils'
import { Logbook } from '@features/Logbook/Logbook.types'

import { ReportingOriginActor, ReportingType } from '../../types'

import type { Reporting } from '../../types'
import type { Column } from '@tanstack/react-table'
import type { CSSProperties } from 'react'

export const getReportingOrigin = (reporting: Reporting.Reporting, isHovering: boolean = false): string => {
  if (reporting.type === ReportingType.ALERT) {
    return 'Alerte auto.'
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

export function getReportingTitle(reporting: Reporting.Reporting, isHovering: boolean = false): string {
  if (reporting.type === ReportingType.ALERT) {
    return getAlertNameFromType(reporting.value.type)
  }

  return isHovering ? `${reporting.value.title}: ${reporting.value.description}` : reporting.value.title
}

export function getRowCellCustomStyle(column: Column<Reporting.Reporting, any>): CSSProperties {
  const defaultStyle = {
    maxWidth: column.getSize(),
    minWidth: column.getSize(),
    width: column.getSize()
  }

  switch (column.id) {
    case Logbook.ApiSortColumn.VESSEL_RISK_FACTOR:
    case 'actions':
      return { ...defaultStyle, verticalAlign: 'bottom' }

    default:
      return defaultStyle
  }
}
