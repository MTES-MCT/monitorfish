import { RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS } from '@api/constants'
import { Body } from '@features/SideWindow/components/Body'
import { Header } from '@features/SideWindow/components/Header'
import { Page } from '@features/SideWindow/components/Page'
import { SubMenu } from '@features/SideWindow/SubMenu'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, TableWithSelectableRows, getFilteredCollection } from '@mtes-mct/monitor-ui'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  getExpandedRowModel
} from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { PRIOR_NOTIFICATION_TABLE_COLUMNS, SUB_MENUS_AS_OPTIONS } from './constants'
import { FilterBar } from './FilterBar'
import { FilterTags } from './FilterTags'
import { Row } from './Row'
import {
  countPriorNotificationsForSeaFrontGroup,
  getApiFilterFromListFilter,
  getLocalFilterFromListFilter,
  getTitle
} from './utils'
import { useGetPriorNotificationsQuery } from '../../api'
import { priorNotificationActions } from '../../slice'
import { PriorNotificationCard } from '../PriorNotificationCard'

import type { AllSeaFrontGroup, NoSeaFrontGroup, SeaFrontGroup } from '@constants/seaFront'

export function PriorNotificationList() {
  const dispatch = useMainAppDispatch()
  const listFilter = useMainAppSelector(state => state.priorNotification.listFilterValues)
  const openedPriorNotificationId = useMainAppSelector(state => state.priorNotification.openedPriorNotificationId)
  const apiFilter = useMemo(() => getApiFilterFromListFilter(listFilter), [listFilter])
  const localFilters = useMemo(() => getLocalFilterFromListFilter(listFilter), [listFilter])
  const selectedSeaFrontGroup = useMainAppSelector(state => state.priorNotification.listFilterValues.seaFrontGroup)
  const {
    data: priorNotifications,
    isError,
    isLoading
  } = useGetPriorNotificationsQuery(apiFilter, RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS)
  const filteredPriorNotifications = useMemo(
    () => getFilteredCollection(priorNotifications, localFilters),
    [localFilters, priorNotifications]
  )

  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([
    {
      desc: true,
      id: 'estimatedTimeOfArrival'
    }
  ])

  const title = getTitle(listFilter.seaFrontGroup)

  const handleSubMenuChange = useCallback(
    (nextSeaFrontGroup: SeaFrontGroup | AllSeaFrontGroup | NoSeaFrontGroup) => {
      dispatch(priorNotificationActions.setListFilterValues({ seaFrontGroup: nextSeaFrontGroup }))
    },
    [dispatch]
  )

  const subMenuCounter = useCallback(
    (seaFrontGroup: SeaFrontGroup | AllSeaFrontGroup | NoSeaFrontGroup): number =>
      countPriorNotificationsForSeaFrontGroup(priorNotifications, seaFrontGroup),
    [priorNotifications]
  )

  const table = useReactTable({
    columns: PRIOR_NOTIFICATION_TABLE_COLUMNS,
    data: filteredPriorNotifications ?? [],
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

  return (
    <>
      <SubMenu
        counter={subMenuCounter}
        onChange={handleSubMenuChange}
        options={SUB_MENUS_AS_OPTIONS}
        value={selectedSeaFrontGroup}
        width={127}
      />

      <Page>
        <Header>
          <Header.Title>{title}</Header.Title>
        </Header>

        <Body>
          <FilterBar />
          <FilterTags />

          <TableWrapper>
            {isError && <div>Une erreur est survenue.</div>}
            {isLoading && <div>Chargement en cours...</div>}
            {!!priorNotifications && (
              <>
                <TableLegend>{`${priorNotifications.length} préavis (tous les horaires sont en UTC)`}</TableLegend>

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
                              <StyledHeadCellInerBox
                                className={header.column.getCanSort() ? 'cursor-pointer' : ''}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getCanSort() &&
                                  ({
                                    asc: <div>▲</div>,
                                    desc: <div>▼</div>
                                  }[header.column.getIsSorted() as string] ?? <Icon.SortingArrows size={14} />)}
                              </StyledHeadCellInerBox>
                            )}
                          </TableWithSelectableRows.Th>
                        ))}
                      </tr>
                    ))}
                  </TableWithSelectableRows.Head>
                  <tbody>
                    {rows.map(row => (
                      <Row key={row.id} row={row} />
                    ))}
                  </tbody>
                </TableWithSelectableRows.Table>
              </>
            )}
          </TableWrapper>
        </Body>
      </Page>

      {!!openedPriorNotificationId && <PriorNotificationCard priorNotificationId={openedPriorNotificationId} />}
    </>
  )
}

const TableWrapper = styled.div`
  box-sizing: border-box;
  flex-direction: column;
  flex-grow: 1;
  width: 1440px;

  * {
    box-sizing: border-box;
  }
`

const TableLegend = styled.p`
  color: ${p => p.theme.color.slateGray};
  line-height: 1;
  margin: 0 0 8px;
`

// TODO Update monitor-ui?
const StyledHeadCellInerBox = styled(TableWithSelectableRows.SortContainer)`
  > div {
    &.Element-IconBox {
      margin-top: 4px;
    }

    // Caret down/up
    &:not(.Element-IconBox) {
      margin-top: -2px;
    }
  }
`
