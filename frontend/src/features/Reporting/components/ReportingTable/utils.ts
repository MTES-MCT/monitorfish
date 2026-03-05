import { Logbook } from '@features/Logbook/Logbook.types'
import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { ReportingType } from '@features/Reporting/types/ReportingType'

import type { Reporting } from '../../types'
import type { Column } from '@tanstack/react-table'
import type { CSSProperties } from 'react'

export const getReportingOrigin = (reporting: Reporting.Reporting, isHovering: boolean = false): string => {
  if (reporting.type === ReportingType.ALERT) {
    return 'Alerte auto.'
  }

  switch (reporting.value.reportingActor) {
    case ReportingOriginSource.UNIT:
      return `${reporting.value.controlUnit?.name ?? ''}${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    case ReportingOriginSource.OPS:
      return `Pôle OPS (${reporting.createdBy})`
    case ReportingOriginSource.SIP:
      return `Pôle SIP (${reporting.createdBy})`
    case ReportingOriginSource.DIRM:
      return `DIRM${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    case ReportingOriginSource.DML:
      return `${reporting.value.dml}${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    case ReportingOriginSource.OTHER:
      return reporting.value.authorContact ?? ''
    default:
      return ''
  }
}

export function getReportingTitle(reporting: Reporting.Reporting, isHovering: boolean = false): string {
  if (reporting.type === ReportingType.ALERT) {
    return reporting.value.name ?? ''
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
