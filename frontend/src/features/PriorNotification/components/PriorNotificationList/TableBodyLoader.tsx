import { TableWithSelectableRows } from '@mtes-mct/monitor-ui'

import { TABLE_COLUMNS } from './columns'
import { DEFAULT_PAGE_SIZE } from './constants'

export function TableBodyLoader() {
  const emptyRows = new Array(DEFAULT_PAGE_SIZE).fill(undefined)

  return (
    <tbody>
      {emptyRows.map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <TableWithSelectableRows.BodyTr key={`row-${index}`}>
          {TABLE_COLUMNS.map(column => (
            <TableWithSelectableRows.Td key={column.id} $isLoading />
          ))}
        </TableWithSelectableRows.BodyTr>
      ))}
    </tbody>
  )
}
