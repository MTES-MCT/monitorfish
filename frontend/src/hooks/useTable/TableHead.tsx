import { FlexboxGrid } from 'rsuite'
import styled from 'styled-components'

import { CardTableColumnTitle } from '../../ui/card-table/CardTableColumnTitle'

import type { TableColumn } from './types'
import type { Promisable } from 'type-fest'

export type TableHeadProps = {
  columns: TableColumn[]
  isSortingDesc: boolean
  onSort: (key: string, isDesc: boolean) => Promisable<void>
  sortingKey?: string | undefined
}

export function TableHead({ columns, isSortingDesc, onSort, sortingKey }: TableHeadProps) {
  const sortByKey = (column: TableColumn) => {
    if (!column.isSortable) {
      return
    }

    onSort(column.key, column.key === sortingKey && !isSortingDesc)
  }

  return (
    <StyledHeader>
      <FlexboxGrid as="tr">
        {columns.map(column => (
          <CellWrapper key={column.key} $fixedWidth={column.fixedWidth} as="th">
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
    </StyledHeader>
  )
}

const CellWrapper = styled(FlexboxGrid.Item)<{
  $fixedWidth: number | undefined
}>`
  align-items: center;
  border: 1px solid ${p => p.theme.color.lightGray};
  border-radius: 1px;
  display: flex;
  height: 36px;
  max-width: ${p => (p.$fixedWidth ? `${p.$fixedWidth}px` : 'auto')};
  min-width: ${p => (p.$fixedWidth ? `${p.$fixedWidth}px` : 'auto')};
  padding: 0 10px;
  user-select: 'none';
  flex-grow: ${p => (p.$fixedWidth ? 0 : 1)};
`

const StyledHeader = styled.thead`
  background-color: ${p => p.theme.color.gainsboro};
  text-align: left;
`
