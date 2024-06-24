import { TableWithSelectableRows } from '@mtes-mct/monitor-ui'

import { getTableColumns } from './columns'
import { DEFAULT_PAGE_SIZE } from './constants'

type TableBodyLoaderProps = Readonly<{
  isFromUrl: boolean
}>
export function TableBodyLoader({ isFromUrl }: TableBodyLoaderProps) {
  const emptyRows = new Array(DEFAULT_PAGE_SIZE).fill(undefined)
  const tableColumns = getTableColumns(isFromUrl)

  return (
    <tbody>
      {emptyRows.map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <TableWithSelectableRows.BodyTr key={`row-${index}`}>
          {tableColumns.map(column => (
            <TableWithSelectableRows.Td key={column.id} $isLoading />
          ))}
        </TableWithSelectableRows.BodyTr>
      ))}
    </tbody>
  )
}
