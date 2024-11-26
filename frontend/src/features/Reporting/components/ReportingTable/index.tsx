import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS, RtkCacheTagType, WindowContext } from '@api/constants'
import { ErrorWall } from '@components/ErrorWall'
import { NO_SEAFRONT_GROUP, type NoSeafrontGroup, SeafrontGroup } from '@constants/seafront'
import { getReportingTableColumns } from '@features/Reporting/components/ReportingTable/columns'
import { TableBodyEmptyData } from '@features/Reporting/components/ReportingTable/TableBodyEmptyData'
import { useGetReportingsQuery } from '@features/Reporting/reportingApi'
import { isNotObservationReporting } from '@features/Reporting/utils'
import { Body } from '@features/SideWindow/components/Body'
import { Page } from '@features/SideWindow/components/Page'
import { useForceUpdate } from '@hooks/useForceUpdate'
import { useHandleFrontendApiError } from '@hooks/useHandleFrontendApiError'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Icon, IconButton, TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { downloadAsCsv } from '@utils/downloadAsCsv'
import dayjs from 'dayjs'
import { useMemo, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import { getReportingOrigin, getReportingTitle } from './utils'
import { CardTableFilters } from '../../../../ui/card-table/CardTableFilters'
import { FilterTableInput } from '../../../../ui/card-table/FilterTableInput'
import { SkeletonRow } from '../../../../ui/Table/SkeletonRow'
import { TableWithSelectableRowsHeader } from '../../../../ui/Table/TableWithSelectableRowsHeader'
import { ALERTS_MENU_SEAFRONT_TO_SEAFRONTS } from '../../../Alert/constants'
import { archiveReportings } from '../../useCases/archiveReportings'
import { deleteReportings } from '../../useCases/deleteReportings'

import type { Reporting } from '@features/Reporting/types'
import type { SortingState } from '@tanstack/react-table'
import type { MutableRefObject } from 'react'

type ReportingTableProps = Readonly<{
  isFromUrl: boolean
  selectedSeafrontGroup: SeafrontGroup | NoSeafrontGroup
}>
export function ReportingTable({ isFromUrl, selectedSeafrontGroup }: ReportingTableProps) {
  const dispatch = useMainAppDispatch()
  const searchInputRef = useRef() as MutableRefObject<HTMLInputElement>
  const [rowSelection, setRowSelection] = useState({})
  const rowSelectionAsArray = Object.keys(rowSelection).map(Number)
  const [sorting, setSorting] = useState<SortingState>([{ desc: true, id: 'name' }])

  const { data, error, isError, isLoading } = useGetReportingsQuery(undefined, RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS)

  useHandleFrontendApiError(DisplayedErrorKey.SIDE_WINDOW_REPORTING_LIST_ERROR, error, RtkCacheTagType.Reportings)

  const { forceDebouncedUpdate } = useForceUpdate()

  const baseUrl = useMemo(() => window.location.origin, [])

  const currentSeafrontReportings = useMemo(() => {
    const currentReportings = data ?? []

    if (selectedSeafrontGroup === NO_SEAFRONT_GROUP) {
      return currentReportings.filter(isNotObservationReporting).filter(reporting => !reporting.value.seaFront)
    }

    return currentReportings
      .filter(isNotObservationReporting)
      .filter(
        reporting =>
          ALERTS_MENU_SEAFRONT_TO_SEAFRONTS[selectedSeafrontGroup] &&
          reporting.value.seaFront &&
          ALERTS_MENU_SEAFRONT_TO_SEAFRONTS[selectedSeafrontGroup].seafronts.includes(reporting.value.seaFront)
      )
  }, [data, selectedSeafrontGroup])

  const archive = () => {
    dispatch(archiveReportings(currentSeafrontReportings, rowSelectionAsArray, WindowContext.SideWindow))
  }

  const download = () => {
    const checkedCurrentSeafrontReportings = currentSeafrontReportings.filter(reporting =>
      rowSelectionAsArray.includes(reporting.id)
    )
    const fileName = `${checkedCurrentSeafrontReportings.length}-signalements-${dayjs().format('DD-MM-YYYY')}`

    /* eslint-disable sort-keys-fix/sort-keys-fix */
    downloadAsCsv(fileName, checkedCurrentSeafrontReportings, {
      creationDate: 'Ouvert le',
      'value.dml': 'DML concernée',
      type: {
        label: 'Origine',
        transform: getReportingOrigin
      },
      'value.type': {
        label: 'Titre',
        transform: getReportingTitle
      },
      'value.description': 'Description',
      'value.natinfCode': 'NATINF',
      flagState: 'Pavillon',
      vesselName: 'Navire',
      internalReferenceNumber: 'CFR',
      externalReferenceNumber: 'Marquage ext.',
      ircs: 'C/S',
      underCharter: {
        label: 'Navire sous charte',
        transform: reporting => (reporting.underCharter ? 'OUI' : 'NON')
      },
      'value.seaFront': 'Façade'
    })
  }
  /* eslint-enable sort-keys-fix/sort-keys-fix */

  const remove = () => {
    dispatch(deleteReportings(currentSeafrontReportings, rowSelectionAsArray, WindowContext.SideWindow))
  }

  const columns = useMemo(
    () =>
      isLoading
        ? getReportingTableColumns(isFromUrl).map(column => ({ ...column, cell: SkeletonRow }))
        : getReportingTableColumns(isFromUrl),
    [isLoading, isFromUrl]
  )

  const tableData = useMemo(
    () => (isLoading ? Array(5).fill({}) : currentSeafrontReportings),
    [isLoading, currentSeafrontReportings]
  )

  const table = useReactTable<Reporting.Reporting>({
    columns,
    data: tableData,
    enableRowSelection: true,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id.toString(),
    manualPagination: false,
    manualSorting: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      rowSelection,
      sorting
    }
  })

  const { rows } = table.getRowModel()

  return (
    <Page>
      <Body>
        <CardTableFilters>
          <FilterTableInput
            ref={searchInputRef}
            $baseUrl={baseUrl}
            data-cy="side-window-reporting-search"
            onChange={forceDebouncedUpdate}
            placeholder="Rechercher un signalement"
            type="text"
          />
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
        </CardTableFilters>

        <TableOuterWrapper $isFromUrl={isFromUrl}>
          <TableInnerWrapper $hasError={isError}>
            {isError && <ErrorWall displayedErrorKey={DisplayedErrorKey.SIDE_WINDOW_REPORTING_LIST_ERROR} />}
            {!isError && (
              <TableWithSelectableRows.Table $withRowCheckbox data-cy="side-window-reporting-list">
                <TableWithSelectableRows.Head>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableWithSelectableRowsHeader key={headerGroup.id} headerGroup={headerGroup} />
                  ))}
                </TableWithSelectableRows.Head>

                {currentSeafrontReportings.length === 0 && <TableBodyEmptyData />}
                {!!currentSeafrontReportings.length && (
                  <tbody>
                    {rows.map(row => (
                      <TableWithSelectableRows.BodyTr data-cy="ReportingList-reporting">
                        {row.getVisibleCells().map(cell => (
                          <Row
                            key={cell.id}
                            $isCenter={cell.column.id === 'actions'}
                            style={{
                              maxWidth: cell.column.getSize(),
                              minWidth: cell.column.getSize(),
                              width: cell.column.getSize()
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Row>
                        ))}
                      </TableWithSelectableRows.BodyTr>
                    ))}
                  </tbody>
                )}
              </TableWithSelectableRows.Table>
            )}
          </TableInnerWrapper>
        </TableOuterWrapper>
      </Body>
    </Page>
  )
}

const RightAligned = styled.div`
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

const TableOuterWrapper = styled.div<{
  $isFromUrl: boolean
}>`
  align-self: flex-start;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  * {
    box-sizing: border-box;
  }
`

const TableInnerWrapper = styled.div<{
  $hasError: boolean
}>`
  align-items: flex-start;
  height: 519px; /* = table height - 5px (negative margin-top) + 1px for Chrome compatibility */
  min-width: 1407px; /* = table width + right padding + scrollbar width (8px) */
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
