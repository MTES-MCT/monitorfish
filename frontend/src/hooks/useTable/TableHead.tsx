import { Checkbox, FlexboxGrid } from 'rsuite'
import styled from 'styled-components'

import { CardTableColumnTitle } from '../../ui/card-table/CardTableColumnTitle'
import { CardTableHeader } from '../../ui/card-table/CardTableHeader'

import type { TableColumn } from './types'
import type { Promisable } from 'type-fest'

export type TableHeadProps = {
  columns: TableColumn[]
  isAllChecked?: boolean
  isCheckable?: boolean
  isSortingDesc: boolean
  onAllCheckChange: () => Promisable<void>
  onSort: (key: string, isDesc: boolean) => Promisable<void>
  sortingKey?: string
}
export function TableHead({
  columns,
  isAllChecked,
  isCheckable,
  isSortingDesc,
  onAllCheckChange,
  onSort,
  sortingKey
}: TableHeadProps) {
  return (
    <CardTableHeader>
      <FlexboxGrid>
        {isCheckable && (
          <FlexboxGrid.Item
            style={{
              alignItems: 'center',
              display: 'flex',
              height: 15,
              paddingRight: 10,
              userSelect: 'none',
              width: '2.25rem'
            }}
          >
            <StyledCheckbox checked={isAllChecked} onChange={onAllCheckChange} />
          </FlexboxGrid.Item>
        )}
        {columns.map(({ fixedWidth, isSortable, key, label }) => (
          <FlexboxGrid.Item
            key={key}
            style={{
              alignItems: 'center',
              display: 'flex',
              height: 15,
              paddingRight: 10,
              userSelect: 'none',
              width: `${fixedWidth}rem`
            }}
          >
            <CardTableColumnTitle
              isAscending={!isSortingDesc}
              isSortable={isSortable}
              isSortColumn={key === sortingKey}
              onClick={() => onSort(key, key === sortingKey && !isSortingDesc)}
            >
              {label}
            </CardTableColumnTitle>
          </FlexboxGrid.Item>
        ))}
      </FlexboxGrid>
    </CardTableHeader>
  )
}

export const StyledCheckbox = styled(Checkbox)`
  height: 36px;
`
