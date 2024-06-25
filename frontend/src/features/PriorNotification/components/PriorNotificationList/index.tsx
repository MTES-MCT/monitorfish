import { BackendApi } from '@api/BackendApi.types'
import { RTK_FORCE_REFETCH_QUERY_OPTIONS, RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS, RtkCacheTagType } from '@api/constants'
import { ErrorWall } from '@components/ErrorWall'
import { LogbookMessage } from '@features/Logbook/LogbookMessage.types'
import { openPriorNotificationForm } from '@features/PriorNotification/useCases/openPriorNotificationForm'
import { Body } from '@features/SideWindow/components/Body'
import { Header } from '@features/SideWindow/components/Header'
import { Page } from '@features/SideWindow/components/Page'
import { SubMenu } from '@features/SideWindow/SubMenu'
import { useHandleFrontendApiError } from '@hooks/useHandleFrontendApiError'
import { useListPagination } from '@hooks/useListPagination'
import { useListSorting } from '@hooks/useListSorting'
import { useLoadingState } from '@hooks/useLoadingState'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Accent, Button, Icon, Size, TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import { flexRender, getCoreRowModel, useReactTable, getExpandedRowModel } from '@tanstack/react-table'
import { isLegacyFirefox } from '@utils/isLegacyFirefox'
import { useIsSuperUser } from 'auth/hooks/useIsSuperUser'
import { useCallback, useState } from 'react'
import styled, { css } from 'styled-components'

import { getTableColumns } from './columns'
import { DEFAULT_PAGE_SIZE, SUB_MENUS_AS_OPTIONS } from './constants'
import { FilterBar } from './FilterBar'
import { FilterTags } from './FilterTags'
import { Row } from './Row'
import { TableBodyLoader } from './TableBodyLoader'
import { getTitle } from './utils'
import { useGetPriorNotificationsQuery } from '../../priorNotificationApi'
import { priorNotificationActions } from '../../slice'
import { PriorNotificationCard } from '../PriorNotificationCard'
import { PriorNotificationForm } from '../PriorNotificationForm'

import type { AllSeafrontGroup, NoSeafrontGroup, SeafrontGroup } from '@constants/seafront'

type PriorNotificationListProps = Readonly<{
  isFromUrl: boolean
}>
export function PriorNotificationList({ isFromUrl }: PriorNotificationListProps) {
  const dispatch = useMainAppDispatch()
  const listFilter = useMainAppSelector(state => state.priorNotification.listFilterValues)
  const isPriorNotificationCardOpen = useMainAppSelector(state => state.priorNotification.isPriorNotificationCardOpen)
  const isPriorNotificationFormOpen = useMainAppSelector(state => state.priorNotification.isPriorNotificationFormOpen)
  const isSuperUser = useIsSuperUser()

  const [rowSelection, setRowSelection] = useState({})

  const { apiPaginationParams, reactTablePaginationState, setReactTablePaginationState } = useListPagination(
    DEFAULT_PAGE_SIZE,
    listFilter
  )
  const { apiSortingParams, reactTableSortingState, setReactTableSortingState } =
    useListSorting<LogbookMessage.ApiSortColumn>(
      LogbookMessage.ApiSortColumn.EXPECTED_ARRIVAL_DATE,
      BackendApi.SortDirection.DESC
    )

  const rtkQueryParams = {
    apiPaginationParams,
    apiSortingParams,
    listFilter
  }
  const { data, error, isError, isFetching } = useGetPriorNotificationsQuery(rtkQueryParams, {
    ...RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS,
    ...RTK_FORCE_REFETCH_QUERY_OPTIONS
  })
  useHandleFrontendApiError(
    DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_LIST_ERROR,
    error,
    RtkCacheTagType.PriorNotifications
  )
  const { data: priorNotifications, extraData, totalLength } = data ?? {}

  const loadingState = useLoadingState(isFetching, { apiSortingParams, listFilter }, apiPaginationParams)
  const title = getTitle(listFilter.seafrontGroup)

  const handleSubMenuChange = useCallback(
    (nextSeafrontGroup: SeafrontGroup | AllSeafrontGroup | NoSeafrontGroup) => {
      dispatch(priorNotificationActions.setListFilterValues({ seafrontGroup: nextSeafrontGroup }))
    },
    [dispatch]
  )

  const subMenuCounter = useCallback(
    (seafrontGroup: SeafrontGroup | AllSeafrontGroup | NoSeafrontGroup): number =>
      extraData?.perSeafrontGroupCount[seafrontGroup] ?? 0,
    [extraData]
  )

  const table = useReactTable({
    columns: getTableColumns(isFromUrl),
    data: priorNotifications ?? [],
    enableRowSelection: true,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getRowId: row => row.id,
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
    <>
      <SubMenu
        counter={subMenuCounter}
        onChange={handleSubMenuChange}
        options={SUB_MENUS_AS_OPTIONS}
        value={listFilter.seafrontGroup}
        width={127}
      />

      <Page>
        <Header>
          <Header.Title>{title}</Header.Title>
        </Header>

        <Body>
          <FilterBar />
          <FilterTags />

          <TableOuterWrapper $isFromUrl={isFromUrl}>
            <TableTop $isFromUrl={isFromUrl}>
              <TableLegend>{`${
                loadingState.isLoadingNewPage || totalLength === undefined ? '...' : totalLength
              } préavis (tous les horaires sont en UTC)`}</TableLegend>

              {isSuperUser && (
                <Button
                  accent={Accent.PRIMARY}
                  Icon={Icon.Plus}
                  onClick={() => dispatch(openPriorNotificationForm(undefined))}
                  size={Size.SMALL}
                >
                  Ajouter un préavis
                </Button>
              )}
            </TableTop>

            <TableInnerWrapper $hasError={isError}>
              {isError && <ErrorWall displayedErrorKey={DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_LIST_ERROR} />}
              {!isError && (
                <TableWithSelectableRows.Table $withRowCheckbox>
                  <TableWithSelectableRows.Head>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <TableWithSelectableRows.Th key={header.id} $width={header.column.getSize()}>
                            {header.id === 'select' && flexRender(header.column.columnDef.header, header.getContext())}
                            {header.id !== 'select' && !header.isPlaceholder && (
                              <TableWithSelectableRows.SortContainer
                                className={header.column.getCanSort() ? 'cursor-pointer' : ''}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getCanSort() &&
                                  ({
                                    asc: <Icon.SortSelectedDown size={14} />,
                                    desc: <Icon.SortSelectedUp size={14} />
                                  }[header.column.getIsSorted() as string] ?? <Icon.SortingArrows size={14} />)}
                              </TableWithSelectableRows.SortContainer>
                            )}
                          </TableWithSelectableRows.Th>
                        ))}
                      </tr>
                    ))}
                  </TableWithSelectableRows.Head>
                  {loadingState.isLoadingNewPage && <TableBodyLoader isFromUrl={isFromUrl} />}
                  {!loadingState.isLoadingNewPage && !!priorNotifications && (
                    <tbody>
                      {rows.map(row => (
                        <Row key={row.id} row={row} />
                      ))}
                    </tbody>
                  )}
                </TableWithSelectableRows.Table>
              )}
            </TableInnerWrapper>

            {loadingState.isLoadingNextPage && (
              <Button accent={Accent.SECONDARY} disabled isFullWidth>
                Chargement en cours...
              </Button>
            )}
            {!isError &&
              !loadingState.isLoadingNewPage &&
              !loadingState.isLoadingNextPage &&
              table.getCanNextPage() && (
                <Button accent={Accent.SECONDARY} isFullWidth onClick={table.nextPage}>
                  {`Charger les ${Math.min(
                    totalLength! - priorNotifications!.length,
                    DEFAULT_PAGE_SIZE
                  )} préavis suivants`}
                </Button>
              )}
          </TableOuterWrapper>
        </Body>
      </Page>

      {isPriorNotificationCardOpen && <PriorNotificationCard />}
      {isPriorNotificationFormOpen && <PriorNotificationForm />}
    </>
  )
}

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

  > .Element-Button {
    margin-top: 8px;
    width: ${p => (!p.$isFromUrl && isLegacyFirefox() ? 1396 : 1391)}px; /* = table width */
  }
`

const TableTop = styled.div<{
  $isFromUrl: boolean
}>`
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  width: ${p => (!p.$isFromUrl && isLegacyFirefox() ? 1396 : 1391)}px; /* = table width */
`

const TableLegend = styled.p`
  color: ${p => p.theme.color.slateGray};
  line-height: 1;
  margin: 0;
`

const TableInnerWrapper = styled.div<{
  $hasError: boolean
}>`
  align-items: flex-start;
  height: ${() => (isLegacyFirefox() ? 518 : 513)}px; /* = table height - 5px */
  min-width: 1407px; /* = table width + right padding + scrollbar width (8px) */
  padding-right: 8px;
  overflow-y: scroll;
  width: auto;

  > table {
    margin-top: -4.5px;
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
