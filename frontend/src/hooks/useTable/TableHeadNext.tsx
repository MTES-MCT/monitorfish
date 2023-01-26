// TODO This component will replace the current <TableHead /> one.

import { Checkbox } from 'rsuite'
import styled from 'styled-components'

import { CardTableColumnTitle } from '../../ui/card-table/CardTableColumnTitle'

import type { TableColumn } from './types'
import type { Promisable } from 'type-fest'

export type TableHeadNextProps = {
  columns: TableColumn[]
  isAllChecked?: boolean | undefined
  isCheckable?: boolean | undefined
  isSortingDesc: boolean
  onAllCheckChange: () => Promisable<void>
  onSort: (key: string, isDesc: boolean) => Promisable<void>
  sortingKey?: string | undefined
}
export function TableHeadNext({
  columns,
  isAllChecked,
  isCheckable,
  isSortingDesc,
  onAllCheckChange,
  onSort,
  sortingKey
}: TableHeadNextProps) {
  return (
    <Wrapper>
      <tr>
        {isCheckable && (
          <Cell
            style={{
              height: 15,
              lineHeight: 1.125,
              paddingRight: 10,
              width: '2.25rem'
            }}
          >
            <StyledCheckbox checked={isAllChecked} onChange={onAllCheckChange} />
          </Cell>
        )}
        {columns.map(({ fixedWidth, isSortable, key, label = '' }) => (
          <Cell
            key={key}
            style={{
              height: 15,
              lineHeight: 1.125,
              paddingRight: 10,
              width: `${fixedWidth}rem`
            }}
          >
            <CardTableColumnTitle
              dataCy={`table-order-by-${key}`}
              isAscending={!isSortingDesc}
              isSortable={isSortable}
              isSortColumn={key === sortingKey}
              onClick={() => onSort(key, key === sortingKey && !isSortingDesc)}
              style={{
                lineHeight: 1.125
              }}
            >
              {label}
            </CardTableColumnTitle>
          </Cell>
        ))}
      </tr>
    </Wrapper>
  )
}

const Wrapper = styled.thead`
  background: ${p => p.theme.color.gainsboro};
  border-radius: 1px;
  border: 1px solid ${p => p.theme.color.lightGray};
  color: ${p => p.theme.color.slateGray} !important;
  display: table-header-group;
  font-weight: 500;
  height: 15px;
  overflow: hidden;
  transition: background 3s;
  user-select: none;

  * {
    color: ${p => p.theme.color.slateGray} !important;
    line-height: 18px;
  }
`

const Cell = styled.th`
  font-weight: inherit;
  padding: 0.25rem;
`

const StyledCheckbox = styled(Checkbox)`
  height: 36px;
`
