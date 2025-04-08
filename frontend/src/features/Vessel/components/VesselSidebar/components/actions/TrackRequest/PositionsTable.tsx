import {
  DUMMY_VESSEL_POSITION,
  POSITION_TABLE_COLUMNS
} from '@features/Vessel/components/VesselSidebar/components/actions/TrackRequest/constants'
import { TableBodyEmptyData } from '@features/Vessel/components/VesselSidebar/components/actions/TrackRequest/TableBodyEmptyData'
import { useClickOutsideWhenOpenedAndExecute } from '@hooks/useClickOutsideWhenOpenedAndExecute'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useTableVirtualizer } from '@hooks/useTableVirtualizer'
import { Icon, SimpleTable } from '@mtes-mct/monitor-ui'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { notUndefined } from '@tanstack/react-virtual'
import { assertNotNullish } from '@utils/assertNotNullish'
import { range } from 'lodash-es'
import { useMemo, useRef } from 'react'
import styled from 'styled-components'

import { SkeletonRow } from '../../../../../../../ui/Table/SkeletonRow'
import { highlightVesselTrackPosition } from '../../../../../slice'

import type { VesselPositionWithId } from '@features/Vessel/components/VesselSidebar/components/actions/TrackRequest/types'

export function PositionsTable() {
  const dispatch = useMainAppDispatch()
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const selectedVesselPositions = useMainAppSelector(state => state.vessel.selectedVesselPositions)
  const loadingPositions = useMainAppSelector(state => state.vessel.loadingPositions)

  useClickOutsideWhenOpenedAndExecute(tableContainerRef, true, () => {
    dispatch(highlightVesselTrackPosition(null))
  })

  const columns = useMemo(
    () =>
      loadingPositions
        ? POSITION_TABLE_COLUMNS.map(column => ({ ...column, cell: SkeletonRow }))
        : POSITION_TABLE_COLUMNS,
    [loadingPositions]
  )

  const tableData: VesselPositionWithId[] = useMemo(
    () =>
      loadingPositions
        ? range(5).map(id => ({ ...DUMMY_VESSEL_POSITION, id }))
        : (selectedVesselPositions?.map((position, index) => ({
            ...position,
            id: index
          })) ?? []),
    [loadingPositions, selectedVesselPositions]
  )

  const isBodyEmptyDataVisible = !tableData?.length

  const table = useReactTable({
    columns,
    data: tableData,
    enableSortingRemoval: true,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id.toString(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          desc: true,
          id: 'dateTime'
        }
      ]
    },
    rowCount: tableData?.length ?? 0
  })

  const { rows } = table.getRowModel()

  const rowVirtualizer = useTableVirtualizer({ estimateSize: 42, overscan: 50, ref: tableContainerRef, rows })
  const virtualRows = rowVirtualizer.getVirtualItems()
  const [paddingBeforeRows, paddingAfterRows] =
    virtualRows.length > 0
      ? [
          notUndefined(virtualRows[0]).start - rowVirtualizer.options.scrollMargin,
          rowVirtualizer.getTotalSize() - notUndefined(virtualRows[virtualRows.length - 1]).end
        ]
      : [0, 0]

  return (
    <Wrapper ref={tableContainerRef}>
      <SimpleTable.Table>
        <SimpleTable.Head>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <SimpleTable.Th key={header.id} $width={header.column.getSize()}>
                  {!header.isPlaceholder && (
                    <SimpleTable.SortContainer
                      className={header.column.getCanSort() ? 'cursor-pointer' : ''}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() &&
                        ({
                          asc: <Icon.SortSelectedDown size={14} />,
                          desc: <Icon.SortSelectedUp size={14} />
                        }[header.column.getIsSorted() as string] ?? <Icon.SortingArrows size={14} />)}
                    </SimpleTable.SortContainer>
                  )}
                </SimpleTable.Th>
              ))}
            </tr>
          ))}
        </SimpleTable.Head>

        {isBodyEmptyDataVisible && <TableBodyEmptyData />}
        {!isBodyEmptyDataVisible && (
          <tbody>
            {paddingBeforeRows > 0 && (
              <tr>
                <td aria-label="padding before" colSpan={columns.length} style={{ height: paddingBeforeRows }} />
              </tr>
            )}
            {virtualRows.map(virtualRow => {
              const row = rows[virtualRow?.index]
              assertNotNullish(row)

              return (
                <SimpleTable.BodyTr
                  key={virtualRow.key}
                  ref={node => rowVirtualizer?.measureElement(node)}
                  data-id={row.id}
                  data-index={virtualRow?.index}
                >
                  {row
                    ?.getVisibleCells()
                    .map(cell => (
                      <SimpleTable.Td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </SimpleTable.Td>
                    ))}
                </SimpleTable.BodyTr>
              )
            })}
            {paddingAfterRows > 0 && (
              <tr>
                <td aria-label="padding after" colSpan={columns.length} style={{ height: paddingAfterRows }} />
              </tr>
            )}
          </tbody>
        )}
      </SimpleTable.Table>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  max-height: 500px;
  overflow: auto;
  text-align: center;
`
