import { BackendApi } from '@api/BackendApi.types'
import { WindowContext } from '@api/constants'
import { ConfirmationModal } from '@components/ConfirmationModal'
import { ErrorWall } from '@components/ErrorWall'
import { Bold } from '@components/style'
import { SeafrontGroup } from '@constants/seafront'
import { getReportingTableColumns } from '@features/Reporting/components/ReportingTable/columns'
import { REPORTING_CSV_MAP } from '@features/Reporting/components/ReportingTable/constants'
import { EditReporting } from '@features/Reporting/components/ReportingTable/EditReporting'
import { Filters } from '@features/Reporting/components/ReportingTable/Filters'
import { reportingTableFiltersActions } from '@features/Reporting/components/ReportingTable/Filters/slice'
import {
  useGetFilteredReportingsQuery,
  useReportingsListFilter
} from '@features/Reporting/components/ReportingTable/Filters/useGetFilteredReportingsQuery'
import { TableBodyEmptyData } from '@features/Reporting/components/ReportingTable/TableBodyEmptyData'
import { getRowCellCustomStyle } from '@features/Reporting/components/ReportingTable/utils'
import { DEFAULT_PAGE_SIZE } from '@features/Reporting/constants'
import { ReportingsSortColumn } from '@features/Reporting/types'
import { Body } from '@features/SideWindow/components/Body'
import { Page } from '@features/SideWindow/components/Page'
import { useListPagination } from '@hooks/useListPagination'
import { useListSorting } from '@hooks/useListSorting'
import { useLoadingState } from '@hooks/useLoadingState'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { trackEvent } from '@hooks/useTracking'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Accent, Button, Icon, IconButton, TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { downloadAsCsv } from '@utils/downloadAsCsv'
import { isLegacyFirefox } from '@utils/isLegacyFirefox'
import { pluralize } from '@utils/pluralize'
import dayjs from 'dayjs'
import { range } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

import { SkeletonRow } from '../../../../ui/Table/SkeletonRow'
import { TableWithSelectableRowsHeader } from '../../../../ui/Table/TableWithSelectableRowsHeader'
import { archiveReportings } from '../../useCases/archiveReportings'
import { deleteReportings } from '../../useCases/deleteReportings'

import type { Reporting } from '@features/Reporting/types'

type ReportingTableProps = Readonly<{
  isFromUrl: boolean
  selectedSeafrontGroup: SeafrontGroup
}>
export function ReportingTable({ isFromUrl, selectedSeafrontGroup }: ReportingTableProps) {
  const dispatch = useMainAppDispatch()

  const [isDeletionConfirmationDialogOpen, setIsDeletionConfirmationDialogOpen] = useState(false)
  const [isArchivingConfirmationDialogOpen, setIsArchivingConfirmationDialogOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const rowSelectionAsArray = Object.keys(rowSelection).map(Number)

  const listFilter = useReportingsListFilter(selectedSeafrontGroup)
  const { apiPaginationParams, reactTablePaginationState, setReactTablePaginationState } = useListPagination(
    DEFAULT_PAGE_SIZE,
    listFilter
  )
  const { apiSortingParams, reactTableSortingState, setReactTableSortingState } = useListSorting<
    typeof ReportingsSortColumn
  >(ReportingsSortColumn.REPORTING_DATE, BackendApi.SortDirection.DESC)

  const {
    extraData,
    isError,
    isFetching,
    isLoading,
    reportings: fetchedReportings,
    totalLength
  } = useGetFilteredReportingsQuery({ apiPaginationParams, apiSortingParams, selectedSeafrontGroup })
  const reportings = useMemo(() => fetchedReportings ?? [], [fetchedReportings])

  const loadingState = useLoadingState(isFetching, { apiSortingParams, listFilter }, apiPaginationParams)

  // The seafront sub-menu is rendered by a parent, which has no access to this list's pagination
  // state and so cannot share this query's cache entry.
  useEffect(() => {
    dispatch(reportingTableFiltersActions.setPerSeafrontGroupCount(extraData?.perSeafrontGroupCount))
  }, [dispatch, extraData])

  const confirmArchive = useCallback(() => {
    dispatch(archiveReportings(reportings, rowSelectionAsArray, WindowContext.SideWindow))
    setRowSelection({})
    setIsArchivingConfirmationDialogOpen(false)
  }, [dispatch, reportings, rowSelectionAsArray])

  const download = () => {
    const checkedCurrentSeafrontReportings = reportings.filter(reporting => rowSelectionAsArray.includes(reporting.id))
    const fileName = `${checkedCurrentSeafrontReportings.length}-signalements-${dayjs().format('DD-MM-YYYY')}`

    downloadAsCsv(fileName, checkedCurrentSeafrontReportings, REPORTING_CSV_MAP)

    trackEvent({
      action: `Export de signalements au format CSV`,
      category: 'REPORTING',
      name: 'CNSP'
    })
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
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: setReactTablePaginationState,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setReactTableSortingState,
    rowCount: totalLength ?? 0,
    state: {
      pagination: reactTablePaginationState,
      rowSelection,
      sorting: reactTableSortingState
    }
  })

  const { rows } = table.getRowModel()

  return (
    <Page>
      <Body>
        <TableOuterWrapper>
          <Filters selectedSeafrontGroup={selectedSeafrontGroup} />
          <TableTop $isFromUrl={isFromUrl}>
            <TableLegend>
              {totalLength ?? 0} {pluralize('signalement', totalLength ?? 0)}
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

        <TableInnerWrapper $hasError={isError}>
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
                  {rows.map((row, index) => (
                    <StyledBodyTr key={row.id} data-cy="ReportingTable-reporting" data-index={index}>
                      {row.getVisibleCells().map(cell => (
                        <Row
                          key={cell.id}
                          $isCenter={cell.column.id === 'actions'}
                          style={getRowCellCustomStyle(cell.column)}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Row>
                      ))}
                    </StyledBodyTr>
                  ))}
                </tbody>
              )}
            </TableWithSelectableRows.Table>
          )}
        </TableInnerWrapper>

        {loadingState.isLoadingNextPage && (
          <LoadMore accent={Accent.SECONDARY} disabled>
            Chargement en cours...
          </LoadMore>
        )}
        {!isError && !loadingState.isLoadingNewPage && !loadingState.isLoadingNextPage && table.getCanNextPage() && (
          <LoadMore accent={Accent.SECONDARY} onClick={table.nextPage}>
            {`Charger les ${Math.min((totalLength ?? 0) - reportings.length, DEFAULT_PAGE_SIZE)} signalements suivants`}
          </LoadMore>
        )}
      </Body>
      <EditReporting />
      {isDeletionConfirmationDialogOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Confirmer la suppression"
          message={
            <>
              <p>Êtes-vous sûr de vouloir </p>
              <Bold>{`supprimer ${pluralize('ce', rowSelectionAsArray.length)} ${rowSelectionAsArray.length > 1 ? rowSelectionAsArray.length : ''} ${pluralize('signalement', rowSelectionAsArray.length)} ?`}</Bold>
            </>
          }
          onCancel={() => {
            setIsDeletionConfirmationDialogOpen(false)
          }}
          onConfirm={confirmDelete}
          title={`Suppression ${pluralize('de', rowSelectionAsArray.length)} ${pluralize('signalement', rowSelectionAsArray.length)}`}
        />
      )}
      {isArchivingConfirmationDialogOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Confirmer l'archivage"
          message={
            <>
              <p>Êtes-vous sûr de vouloir </p>
              <Bold>{`archiver ${pluralize('ce', rowSelectionAsArray.length)} ${rowSelectionAsArray.length > 1 ? rowSelectionAsArray.length : ''} ${pluralize('signalement', rowSelectionAsArray.length)} ?`}</Bold>
            </>
          }
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

const LoadMore = styled(Button)`
  margin-top: 8px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
`

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
