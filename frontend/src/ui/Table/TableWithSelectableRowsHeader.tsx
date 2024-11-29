import { Icon, TableWithSelectableRows, THEME } from '@mtes-mct/monitor-ui'
import { flexRender } from '@tanstack/react-table'

export function TableWithSelectableRowsHeader({ headerGroup }) {
  return (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map(header => (
        <TableWithSelectableRows.Th key={header.id} $width={header.column.getSize()}>
          {header.id === 'select' && flexRender(header.column.columnDef.header, header.getContext())}
          {header.id !== 'select' && !header.isPlaceholder && (
            <TableWithSelectableRows.SortContainer
              className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
              onClick={header.column.getToggleSortingHandler()}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}

              {header.column.getCanSort() &&
                ({
                  asc: <Icon.SortSelectedUp size={14} />,
                  desc: <Icon.SortSelectedDown size={14} />
                }[header.column.getIsSorted() as string] ?? (
                  <Icon.SortingChevrons color={THEME.color.lightGray} size={14} />
                ))}
            </TableWithSelectableRows.SortContainer>
          )}
        </TableWithSelectableRows.Th>
      ))}
    </tr>
  )
}
