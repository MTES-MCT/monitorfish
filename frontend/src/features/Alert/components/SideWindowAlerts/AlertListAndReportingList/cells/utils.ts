import type { PendingAlert } from '@features/Alert/types'
import type { Column } from '@tanstack/react-table'
import type { CSSProperties } from 'react'

export function getExpandableRowCellCustomStyle(column: Column<PendingAlert, any>): CSSProperties {
  const defaultStyle = {
    maxWidth: column.getSize()
  }

  switch (column.id) {
    case 'actions':
      return { ...defaultStyle, verticalAlign: 'bottom' }

    default:
      return defaultStyle
  }
}
