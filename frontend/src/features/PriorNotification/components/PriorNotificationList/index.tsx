import { Body } from '@features/SideWindow/components/Body'
import { Header } from '@features/SideWindow/components/Header'
import { Page } from '@features/SideWindow/components/Page'
import { SubMenu } from '@features/SideWindow/SubMenu'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, TableWithSelectableRows, customDayjs } from '@mtes-mct/monitor-ui'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  getExpandedRowModel
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { assertNotNullish } from '@utils/assertNotNullish'
import { Fragment, useCallback, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { PRIOR_NOTIFICATION_TABLE_COLUMNS, SUB_MENUS_AS_OPTIONS } from './constants'
import { FilterBar } from './FilterBar'
import { getApiFilterFromListFilter } from './utils'
import { SeaFrontGroup } from '../../../../domain/entities/seaFront/constants'
import { useGetPriorNotificationsQuery } from '../../api'
import { priorNotificationActions } from '../../slice'

export function PriorNotificationList() {
  // eslint-disable-next-line no-null/no-null
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const dispatch = useMainAppDispatch()
  const listFilter = useMainAppSelector(state => state.priorNotification.listFilterValues)
  const apiFilter = useMemo(() => getApiFilterFromListFilter(listFilter), [listFilter])
  const selectedSeaFrontGroup = useMainAppSelector(state => state.priorNotification.listFilterValues.seaFrontGroup)
  const {
    data: priorNotifications,
    isError,
    isLoading
  } = useGetPriorNotificationsQuery(apiFilter, { pollingInterval: 60000 })

  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([
    {
      desc: true,
      id: 'estimatedTimeOfArrival'
    }
  ])

  const countNoticesForSeaFrontGroup = useCallback(
    (_seaFrontGroup: SeaFrontGroup | 'EXTRA'): number =>
      // TODO Calculate the sea front for each prior notification.
      // return priorNotifications.filter(({ facade }) => {
      //   if (seaFrontGroup === SeaFrontGroup.ALL) {
      //     return true
      //   }

      //   return facade && SEA_FRONT_GROUP_SEA_FRONTS[seaFrontGroup]
      //     ? SEA_FRONT_GROUP_SEA_FRONTS[seaFrontGroup].includes(facade as any)
      //     : false
      // }).length

      0,
    []
  )

  const handleSubMenuChange = useCallback(
    (nextSeaFrontGroup: SeaFrontGroup | 'EXTRA') => {
      dispatch(priorNotificationActions.setListFilterValues({ seaFrontGroup: nextSeaFrontGroup }))
    },
    [dispatch]
  )

  const table = useReactTable({
    columns: PRIOR_NOTIFICATION_TABLE_COLUMNS,
    data: priorNotifications ?? [],
    enableColumnResizing: false,
    enableRowSelection: true,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: rowId => {
      setRowSelection(rowId)
    },
    onSortingChange: setSorting,
    state: {
      rowSelection,
      sorting
    }
  })

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 10,
    // Pass correct keys to virtualizer it's important when rows change position
    getItemKey: useCallback((index: number) => `${rows[index]?.id}`, [rows]),

    getScrollElement: () => tableContainerRef.current,

    overscan: 10
  })

  const virtualRows = rowVirtualizer.getVirtualItems()

  return (
    <>
      <SubMenu
        counter={countNoticesForSeaFrontGroup}
        onChange={handleSubMenuChange}
        options={SUB_MENUS_AS_OPTIONS}
        value={selectedSeaFrontGroup}
      />

      <Page>
        <Header>
          <Header.Title>Préavis</Header.Title>
        </Header>

        <Body>
          <FilterBar />

          <TableWrapper ref={tableContainerRef}>
            {isError && <div>Une erreur est survenue.</div>}
            {isLoading && <div>Chargement en cours...</div>}
            {!!priorNotifications && (
              <TableWithSelectableRows.Table>
                <TableWithSelectableRows.Head>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableWithSelectableRows.Th
                          key={header.id}
                          $width={header.column.getSize()}
                          style={{
                            height: 42
                          }}
                        >
                          {header.isPlaceholder ? undefined : (
                            <TableWithSelectableRows.SortContainer
                              className={header.column.getCanSort() ? 'cursor-pointer' : ''}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getCanSort() &&
                                ({
                                  asc: <div>▲</div>,
                                  desc: <div>▼</div>
                                }[header.column.getIsSorted() as string] ?? <Icon.SortingArrows size={14} />)}
                            </TableWithSelectableRows.SortContainer>
                          )}
                        </TableWithSelectableRows.Th>
                      ))}
                    </tr>
                  ))}
                </TableWithSelectableRows.Head>
                <tbody>
                  {virtualRows.map(virtualRow => {
                    const row = rows[virtualRow.index]
                    if (!row) {
                      throw new Error('Row not found')
                    }

                    const priorNotification = row.original
                    assertNotNullish(priorNotification.logbookMessage?.message)

                    return (
                      <Fragment key={virtualRow.key}>
                        <TableWithSelectableRows.BodyTr>
                          {row?.getVisibleCells().map(cell => (
                            <ExpandableRow
                              key={cell.id}
                              $hasRightBorder={cell.column.id === 'alertCount'}
                              $width={cell.column.getSize()}
                              onClick={() => row.toggleExpanded()}
                              style={{
                                height: 42,
                                padding: '0 16px 1px',
                                verticalAlign: 'middle'
                              }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </ExpandableRow>
                          ))}
                        </TableWithSelectableRows.BodyTr>

                        {row.getIsExpanded() && (
                          <ExpandedRow>
                            <ExpandedRowCell $width={50} />
                            <ExpandedRowCell $width={120}>
                              <p>
                                <ExpandedRowLabel>PNO émis :</ExpandedRowLabel>
                                <ExpandedRowValue>
                                  {customDayjs(priorNotification.logbookMessage.reportDateTime)
                                    .utc()
                                    .format('DD/MM/YYYY [à] hh[h]mm')}
                                </ExpandedRowValue>
                              </p>
                            </ExpandedRowCell>
                            <ExpandedRowCell $width={120}>
                              <p>
                                <ExpandedRowLabel>Raison du PNO :</ExpandedRowLabel>
                                <ExpandedRowValue>{priorNotification.logbookMessage.message.purpose}</ExpandedRowValue>
                              </p>
                            </ExpandedRowCell>
                            <ExpandedRowCell $width={180} />
                            <ExpandedRowCell $width={50} />
                            <ExpandedRowCell $width={160}>
                              <p>
                                {!!priorNotification.vessel?.internalReferenceNumber && (
                                  <ExpandedRowValue $isLight>
                                    {priorNotification.vessel.internalReferenceNumber} (CFR)
                                  </ExpandedRowValue>
                                )}
                                {!!priorNotification.vessel?.ircs && (
                                  <ExpandedRowValue $isLight>
                                    {priorNotification.vessel.ircs} (Call sign)
                                  </ExpandedRowValue>
                                )}
                                {!!priorNotification.vessel?.externalReferenceNumber && (
                                  <ExpandedRowValue $isLight>
                                    {priorNotification.vessel.externalReferenceNumber} (Marq. ext.)
                                  </ExpandedRowValue>
                                )}
                                {!!priorNotification.vessel?.mmsi && (
                                  <ExpandedRowValue $isLight>{priorNotification.vessel.mmsi} (MMSI)</ExpandedRowValue>
                                )}
                              </p>
                              <p>
                                <ExpandedRowLabel>Taille du navire :</ExpandedRowLabel>
                                <ExpandedRowValue>{priorNotification.vessel?.width ?? '-'}</ExpandedRowValue>
                              </p>
                              <p>
                                <ExpandedRowLabel>Dernier contrôle :</ExpandedRowLabel>
                                <ExpandedRowValue>
                                  {priorNotification.vesselRiskFactor?.lastControlDatetime
                                    ? customDayjs(priorNotification.vesselRiskFactor.lastControlDatetime)
                                        .utc()
                                        .format('[Le] DD/MM/YYYY')
                                    : '-'}
                                </ExpandedRowValue>
                              </p>
                            </ExpandedRowCell>
                            <ExpandedRowCell $width={130}>
                              <ExpandedRowLabel>Nom du segment :</ExpandedRowLabel>
                              <span>
                                {priorNotification.tripSegments.map(tripSegment => tripSegment.segmentName).join(', ')}
                              </span>
                            </ExpandedRowCell>
                            <ExpandedRowCell $width={170}>
                              <ExpandedRowLabel>Principales espèces à bord :</ExpandedRowLabel>
                              {priorNotification.logbookMessage.message.catchOnboard ? (
                                <ExpandedRowList>
                                  {priorNotification.logbookMessage.message.catchOnboard.map(
                                    ({ species, speciesName, weight }) => (
                                      <li key={species}>{`${speciesName} (${species}) – ${weight} kg`}</li>
                                    )
                                  )}
                                </ExpandedRowList>
                              ) : (
                                <ExpandedRowValue>Non soumis</ExpandedRowValue>
                              )}
                              <p>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <Link>Voir plus de détail</Link>
                              </p>
                            </ExpandedRowCell>
                            <ExpandedRowCell $width={60} />
                            <ExpandedRowCell $width={56} />
                          </ExpandedRow>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </TableWithSelectableRows.Table>
            )}
          </TableWrapper>
        </Body>
      </Page>
    </>
  )
}

const TableWrapper = styled.div`
  flex-grow: 1;
  width: 1440px;
`

const ExpandableRow = styled(TableWithSelectableRows.Td)`
  cursor: pointer;
  user-select: none;
`

const ExpandedRow = TableWithSelectableRows.BodyTr

const ExpandedRowCell = styled(TableWithSelectableRows.Td).attrs(props => ({
  ...props,
  $hasRightBorder: false
}))`
  padding: 8px 16px 16px;
  white-space: normal;

  > p:not(:first-child) {
    margin-top: 16px;
  }
`

const ExpandedRowLabel = styled.span`
  color: ${p => p.theme.color.slateGray};
  display: block;
  width: 100%;
`
const ExpandedRowValue = styled.span<{
  $isLight?: boolean
}>`
  color: ${p => (p.$isLight ? p.theme.color.slateGray : 'inherit')};
  display: block;
`
const ExpandedRowList = styled.ul`
  list-style: none;
  padding: 0;
`

const Link = styled.button`
  background: none;
  border: none;
  color: ${p => p.theme.color.slateGray};
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  transition: color 0.2s;

  &:hover {
    color: ${p => p.theme.color.gunMetal};
  }
`
