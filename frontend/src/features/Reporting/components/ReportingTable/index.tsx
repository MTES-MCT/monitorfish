import { WindowContext } from '@api/constants'
import { ErrorWall } from '@components/ErrorWall'
import { type NoSeafrontGroup, SeafrontGroup } from '@constants/seafront'
import { getReportingTableColumns } from '@features/Reporting/components/ReportingTable/columns'
import { REPORTING_CSV_MAP } from '@features/Reporting/components/ReportingTable/constants'
import { EditReporting } from '@features/Reporting/components/ReportingTable/EditReporting'
import { Filters } from '@features/Reporting/components/ReportingTable/Filters/Filters'
import { useGetFilteredReportingsQuery } from '@features/Reporting/components/ReportingTable/Filters/useGetFilteredReportingsQuery'
import { TableBodyEmptyData } from '@features/Reporting/components/ReportingTable/TableBodyEmptyData'
import { getRowCellCustomStyle } from '@features/Reporting/components/ReportingTable/utils'
import { Body } from '@features/SideWindow/components/Body'
import { Page } from '@features/SideWindow/components/Page'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useTableVirtualizer } from '@hooks/useTableVirtualizer'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Icon, IconButton, TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { downloadAsCsv } from '@utils/downloadAsCsv'
import dayjs from 'dayjs'
import { range } from 'lodash'
import { useMemo, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import { SkeletonRow } from '../../../../ui/Table/SkeletonRow'
import { TableWithSelectableRowsHeader } from '../../../../ui/Table/TableWithSelectableRowsHeader'
import { archiveReportings } from '../../useCases/archiveReportings'
import { deleteReportings } from '../../useCases/deleteReportings'

import type { Reporting } from '@features/Reporting/types'

type ReportingTableProps = Readonly<{
  isFromUrl: boolean
  selectedSeafrontGroup: SeafrontGroup | NoSeafrontGroup
}>
export function ReportingTable({ isFromUrl, selectedSeafrontGroup }: ReportingTableProps) {
  const dispatch = useMainAppDispatch()
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const [rowSelection, setRowSelection] = useState({})
  const rowSelectionAsArray = Object.keys(rowSelection).map(Number)

  const { isError, isLoading, reportings } = useGetFilteredReportingsQuery(selectedSeafrontGroup)

  const archive = () => {
    dispatch(archiveReportings(reportings, rowSelectionAsArray, WindowContext.SideWindow))
  }

  const download = () => {
    const checkedCurrentSeafrontReportings = reportings.filter(reporting => rowSelectionAsArray.includes(reporting.id))
    const fileName = `${checkedCurrentSeafrontReportings.length}-signalements-${dayjs().format('DD-MM-YYYY')}`

    downloadAsCsv(fileName, checkedCurrentSeafrontReportings, REPORTING_CSV_MAP)
  }

  const remove = () => {
    dispatch(deleteReportings(reportings, rowSelectionAsArray, WindowContext.SideWindow))
  }

  const columns = useMemo(
    () =>
      isLoading
        ? getReportingTableColumns(isFromUrl).map(column => ({ ...column, cell: SkeletonRow }))
        : getReportingTableColumns(isFromUrl),
    [isLoading, isFromUrl]
  )

  const tableData = useMemo(
    () => (isLoading ? range(5).map(id => ({ id }) as Reporting.Reporting) : reportings),
    [isLoading, reportings]
  )

  const table = useReactTable<Reporting.Reporting>({
    columns,
    data: tableData,
    enableRowSelection: true,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id.toString(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          desc: true,
          id: 'date'
        }
      ]
    },
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection
    }
  })

  const { rows } = table.getRowModel()

  const overscan = useMemo(() => (reportings.length > 500 ? 500 : 50), [reportings])
  const rowVirtualizer = useTableVirtualizer({ estimateSize: 42, overscan, ref: tableContainerRef, rows })
  const virtualRows = rowVirtualizer.getVirtualItems()

  return (
    <Page>
      <Body>
        <TableOuterWrapper>
          <Filters />
          <RightAligned>
            <IconButton
              disabled={!rowSelectionAsArray.length}
              Icon={Icon.Download}
              onClick={download}
              title={`Télécharger ${rowSelectionAsArray.length} signalement${rowSelectionAsArray.length > 1 ? 's' : ''}`}
            />
            <IconButton
              data-cy="archive-reporting-cards"
              disabled={!rowSelectionAsArray.length}
              Icon={Icon.Archive}
              onClick={archive}
              title={`Archiver ${rowSelectionAsArray.length} signalement${rowSelectionAsArray.length > 1 ? 's' : ''}`}
            />
            <IconButton
              data-cy="delete-reporting-cards"
              disabled={!rowSelectionAsArray.length}
              Icon={Icon.Delete}
              onClick={remove}
              title={`Supprimer ${rowSelectionAsArray.length} signalement${rowSelectionAsArray.length > 1 ? 's' : ''}`}
            />
          </RightAligned>
        </TableOuterWrapper>

        <TableInnerWrapper ref={tableContainerRef} $hasError={isError}>
          {isError && <ErrorWall displayedErrorKey={DisplayedErrorKey.SIDE_WINDOW_REPORTING_LIST_ERROR} />}
          {!isError && (
            <TableWithSelectableRows.Table $withRowCheckbox data-cy="side-window-reporting-list">
              <TableWithSelectableRows.Head>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableWithSelectableRowsHeader key={headerGroup.id} headerGroup={headerGroup} />
                ))}
              </TableWithSelectableRows.Head>

              {!isLoading && reportings.length === 0 && <TableBodyEmptyData />}
              {!!rows.length && (
                <tbody>
                  {virtualRows.map(virtualRow => {
                    const row = rows[virtualRow?.index]

                    return (
                      <TableWithSelectableRows.BodyTr key={virtualRow.key} data-cy="ReportingList-reporting">
                        {row?.getVisibleCells().map(cell => (
                          <Row
                            key={cell.id}
                            $hasRightBorder={cell.column.id === 'underCharter'}
                            $isCenter={cell.column.id === 'actions'}
                            style={getRowCellCustomStyle(cell.column)}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Row>
                        ))}
                      </TableWithSelectableRows.BodyTr>
                    )
                  })}
                </tbody>
              )}
            </TableWithSelectableRows.Table>
          )}
        </TableInnerWrapper>
      </Body>
      <EditReporting />
    </Page>
  )
}

const TableOuterWrapper = styled.div`
  margin: 0 32px 8px 0;
`

const RightAligned = styled.div`
  margin-top: 16px;
  align-items: flex-end;
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;

  > button:not(:last-child) {
    margin-right: 10px;
  }
`

const Row = styled(TableWithSelectableRows.Td)`
  color: ${p => p.theme.color.charcoal};
`

const TableInnerWrapper = styled.div<{
  $hasError: boolean
}>`
  * {
    box-sizing: border-box;
  }
  height: 619px; /* = table height - 5px (negative margin-top) + 1px for Chrome compatibility */
  min-width: 1271px; /* = table width + right padding + scrollbar width (8px) */
  padding-right: 8px;
  overflow-y: scroll;
  width: auto;

  > table {
    margin-top: -5px;
  }

  ${p =>
    p.$hasError &&
    css`
      align-items: center;
      border: solid 1px ${p.theme.color.lightGray};
      display: flex;
      justify-content: center;
    `}
`
