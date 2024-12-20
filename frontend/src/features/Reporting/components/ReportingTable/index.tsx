import { WindowContext } from '@api/constants'
import { ConfirmationModal } from '@components/ConfirmationModal'
import { ErrorWall } from '@components/ErrorWall'
import { type NoSeafrontGroup, SeafrontGroup } from '@constants/seafront'
import { getReportingTableColumns } from '@features/Reporting/components/ReportingTable/columns'
import { REPORTING_CSV_MAP } from '@features/Reporting/components/ReportingTable/constants'
import { EditReporting } from '@features/Reporting/components/ReportingTable/EditReporting'
import { Filters } from '@features/Reporting/components/ReportingTable/Filters'
import { useGetFilteredReportingsQuery } from '@features/Reporting/components/ReportingTable/Filters/useGetFilteredReportingsQuery'
import { TableBodyEmptyData } from '@features/Reporting/components/ReportingTable/TableBodyEmptyData'
import { getRowCellCustomStyle } from '@features/Reporting/components/ReportingTable/utils'
import { Body } from '@features/SideWindow/components/Body'
import { Page } from '@features/SideWindow/components/Page'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useTableVirtualizer } from '@hooks/useTableVirtualizer'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Icon, IconButton, TableWithSelectableRows, THEME } from '@mtes-mct/monitor-ui'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { notUndefined } from '@tanstack/virtual-core'
import { downloadAsCsv } from '@utils/downloadAsCsv'
import { isLegacyFirefox } from '@utils/isLegacyFirefox'
import { pluralize } from '@utils/pluralize'
import dayjs from 'dayjs'
import { range } from 'lodash'
import { useCallback, useMemo, useRef, useState } from 'react'
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

  const [isDeletionConfirmationDialogOpen, setIsDeletionConfirmationDialogOpen] = useState(false)
  const [isArchivingConfirmationDialogOpen, setIsArchivingConfirmationDialogOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const rowSelectionAsArray = Object.keys(rowSelection).map(Number)

  const { isError, isLoading, reportings } = useGetFilteredReportingsQuery(selectedSeafrontGroup)

  const confirmArchive = useCallback(() => {
    dispatch(archiveReportings(reportings, rowSelectionAsArray, WindowContext.SideWindow))
    setRowSelection({})
    setIsArchivingConfirmationDialogOpen(false)
  }, [dispatch, reportings, rowSelectionAsArray])

  const download = () => {
    const checkedCurrentSeafrontReportings = reportings.filter(reporting => rowSelectionAsArray.includes(reporting.id))
    const fileName = `${checkedCurrentSeafrontReportings.length}-signalements-${dayjs().format('DD-MM-YYYY')}`

    downloadAsCsv(fileName, checkedCurrentSeafrontReportings, REPORTING_CSV_MAP)
  }

  const confirmDelete = useCallback(() => {
    setIsDeletionConfirmationDialogOpen(false)
    dispatch(deleteReportings(reportings, rowSelectionAsArray, WindowContext.SideWindow))
    setRowSelection({})
  }, [dispatch, reportings, rowSelectionAsArray])

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
  const [paddingBeforeRows, paddingAfterRows] =
    virtualRows.length > 0
      ? [
          notUndefined(virtualRows[0]).start - rowVirtualizer.options.scrollMargin,
          rowVirtualizer.getTotalSize() - notUndefined(virtualRows[virtualRows.length - 1]).end
        ]
      : [0, 0]

  return (
    <Page>
      <Body>
        <TableOuterWrapper>
          <Filters />
          <TableTop $isFromUrl={isFromUrl}>
            <TableLegend>
              {reportings.length} {pluralize('signalement', reportings.length)} en cours
            </TableLegend>
            <IconButton
              disabled={!rowSelectionAsArray.length}
              Icon={Icon.Download}
              onClick={download}
              title={`Télécharger ${rowSelectionAsArray.length} ${pluralize('signalement', rowSelectionAsArray.length)}`}
            />
            <IconButton
              data-cy="archive-reporting-cards"
              disabled={!rowSelectionAsArray.length}
              Icon={Icon.Archive}
              onClick={() => {
                setIsArchivingConfirmationDialogOpen(true)
              }}
              title={`Archiver ${rowSelectionAsArray.length} ${pluralize('signalement', rowSelectionAsArray.length)}`}
            />
            <IconButton
              data-cy="delete-reporting-cards"
              disabled={!rowSelectionAsArray.length}
              Icon={Icon.Delete}
              onClick={() => {
                setIsDeletionConfirmationDialogOpen(true)
              }}
              title={`Supprimer ${rowSelectionAsArray.length} ${pluralize('signalement', rowSelectionAsArray.length)}`}
            />
          </TableTop>
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
              {paddingBeforeRows > 0 && (
                <tr>
                  <td aria-label="padding before" colSpan={columns.length} style={{ height: paddingBeforeRows }} />
                </tr>
              )}
              {!!rows.length && (
                <tbody>
                  {virtualRows.map(virtualRow => {
                    const row = rows[virtualRow?.index]

                    return (
                      <StyledBodyTr
                        key={virtualRow.key}
                        ref={node => rowVirtualizer?.measureElement(node)}
                        data-cy="ReportingList-reporting"
                        data-index={virtualRow?.index}
                      >
                        {row?.getVisibleCells().map(cell => (
                          <Row
                            key={cell.id}
                            $hasRightBorder={cell.column.id === 'dml'}
                            $isCenter={cell.column.id === 'actions'}
                            style={getRowCellCustomStyle(cell.column)}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Row>
                        ))}
                      </StyledBodyTr>
                    )
                  })}
                </tbody>
              )}
              {paddingAfterRows > 0 && (
                <tr>
                  <td aria-label="padding after" colSpan={columns.length} style={{ height: paddingAfterRows }} />
                </tr>
              )}
            </TableWithSelectableRows.Table>
          )}
        </TableInnerWrapper>
      </Body>
      <EditReporting />
      {isDeletionConfirmationDialogOpen && (
        <ConfirmationModal
          color={THEME.color.maximumRed}
          confirmationButtonLabel="Supprimer"
          iconName="Delete"
          message={`Êtes-vous sûr de vouloir supprimer ${pluralize('ce', rowSelectionAsArray.length)} ${rowSelectionAsArray.length > 1 ? rowSelectionAsArray.length : ''} ${pluralize('signalement', rowSelectionAsArray.length)} ?`}
          onCancel={() => {
            setIsDeletionConfirmationDialogOpen(false)
          }}
          onConfirm={confirmDelete}
          title={`Suppression ${pluralize('de', rowSelectionAsArray.length)} ${pluralize('signalement', rowSelectionAsArray.length)}`}
        />
      )}
      {isArchivingConfirmationDialogOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Archiver"
          iconName="Archive"
          message={`Êtes-vous sûr de vouloir archiver ${pluralize('ce', rowSelectionAsArray.length)} ${rowSelectionAsArray.length} ${pluralize('signalement', rowSelectionAsArray.length)} ?`}
          onCancel={() => {
            setIsArchivingConfirmationDialogOpen(false)
          }}
          onConfirm={confirmArchive}
          title={`Archivage ${pluralize('de', rowSelectionAsArray.length)} ${pluralize('signalement', rowSelectionAsArray.length)}`}
        />
      )}
    </Page>
  )
}

const StyledBodyTr = styled(TableWithSelectableRows.BodyTr)`
  height: 40px;
  width: 100%;
`

const TableTop = styled.div<{
  $isFromUrl: boolean
}>`
  align-items: flex-end;
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  width: ${p => (!p.$isFromUrl && isLegacyFirefox() ? 1396 : 1290)}px; /* = table width */

  > button(:first) {
    margin-left: auto;
  }

  > button:not(:last-child) {
    margin-right: 8px;
  }
`

const TableLegend = styled.p`
  color: ${p => p.theme.color.slateGray};
  line-height: 1;
  margin-left: 0;
  margin-right: auto;
  float: left;
`

const TableOuterWrapper = styled.div`
  margin: 0 32px 8px 0;
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
  min-width: 1290px; /* = table width + right padding + scrollbar width (8px) */
  padding-right: 8px;
  overflow: auto;
  width: auto;
  position: relative;

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
