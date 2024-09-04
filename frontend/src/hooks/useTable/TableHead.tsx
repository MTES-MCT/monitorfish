import { Checkbox, FlexboxGrid } from 'rsuite'
import styled from 'styled-components'

import { CardTableColumnTitle } from '../../ui/card-table/CardTableColumnTitle'
import { CardTableHeader } from '../../ui/card-table/CardTableHeader'

import type { TableColumn } from './types'
import type { Promisable } from 'type-fest'

export type TableHeadProps = {
  columns: TableColumn[]
  isAllChecked?: boolean | undefined
  isCheckable?: boolean | undefined
  isSortingDesc: boolean
  onAllCheckChange: () => Promisable<void>
  onSort: (key: string, isDesc: boolean) => Promisable<void>
  sortingKey?: string | undefined
}
export function TableHead({
  columns,
  isAllChecked = false,
  isCheckable,
  isSortingDesc,
  onAllCheckChange,
  onSort,
  sortingKey
}: TableHeadProps) {
  const sortByKey = (column: TableColumn) => {
    if (!column.isSortable) {
      return
    }

    onSort(column.key, column.key === sortingKey && !isSortingDesc)
  }

  return (
    <CardTableHeader noPadding>
      <FlexboxGrid role="row">
        {isCheckable && (
          <CellWrapper $fixedWidth={36} style={{ padding: 0 }}>
            <StyledCheckbox checked={isAllChecked} onChange={onAllCheckChange} />
          </CellWrapper>
        )}

        {columns.map(column => (
          <CellWrapper key={column.key} $fixedWidth={column.fixedWidth} role="columnheader">
            <CardTableColumnTitle
              dataCy={`table-order-by-${column.key}`}
              isAscending={!isSortingDesc}
              isSortable={column.isSortable}
              isSortedColumn={column.key === sortingKey}
              onClick={() => sortByKey(column)}
            >
              {column.label ?? ''}
            </CardTableColumnTitle>
          </CellWrapper>
        ))}
      </FlexboxGrid>
    </CardTableHeader>
  )
}

const CellWrapper = styled(FlexboxGrid.Item)<{
  $fixedWidth: number | undefined
}>`
  align-items: center;
  display: flex;
  height: 36px;
  max-width: ${p => (p.$fixedWidth ? `${p.$fixedWidth}px` : 'auto')};
  min-width: ${p => (p.$fixedWidth ? `${p.$fixedWidth}px` : 'auto')};
  padding: 0 10px;
  user-select: 'none';
  flex-grow: ${p => (p.$fixedWidth ? 0 : 1)};
`

export const StyledCheckbox = styled(Checkbox)`
  height: 36px;
`
