import { BackendApi } from '@api/BackendApi.types'
import { RTK_FORCE_REFETCH_QUERY_OPTIONS, RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS, RtkCacheTagType } from '@api/constants'
import { ErrorWall } from '@components/ErrorWall'
import { Logbook } from '@features/Logbook/Logbook.types'
import { OpenedPriorNotificationType } from '@features/PriorNotification/constants'
import { openManualPriorNotificationForm } from '@features/PriorNotification/useCases/openManualPriorNotificationForm'
import { Body } from '@features/SideWindow/components/Body'
import { Header } from '@features/SideWindow/components/Header'
import { Page } from '@features/SideWindow/components/Page'
import { SubMenu } from '@features/SideWindow/SubMenu'
import { useForceUpdate } from '@hooks/useForceUpdate'
import { useHandleFrontendApiError } from '@hooks/useHandleFrontendApiError'
import { useListPagination } from '@hooks/useListPagination'
import { useListSorting } from '@hooks/useListSorting'
import { useLoadingState } from '@hooks/useLoadingState'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { trackEvent } from '@hooks/useTracking'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Accent, Button, Icon, Size, TableWithSelectableRows, usePrevious } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { captureMessage } from '@sentry/react'
import {
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { isLegacyFirefox } from '@utils/isLegacyFirefox'
import { useIsSuperUser } from 'auth/hooks/useIsSuperUser'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import { getTableColumns } from './columns'
import { DEFAULT_PAGE_SIZE, SUB_MENUS_AS_OPTIONS } from './constants'
import { FilterBar } from './FilterBar'
import { FilterTags } from './FilterTags'
import { Row } from './Row'
import { TableBodyEmptyData } from './TableBodyEmptyData'
import { getTitle } from './utils'
import { SkeletonRow } from '../../../../ui/Table/SkeletonRow'
import { useGetPriorNotificationsQuery, useGetPriorNotificationsToVerifyQuery } from '../../priorNotificationApi'
import { priorNotificationActions } from '../../slice'
import { LogbookPriorNotificationForm } from '../LogbookPriorNotificationForm'
import { ManualPriorNotificationForm } from '../ManualPriorNotificationForm'
import { ReportingList } from '../ReportingList'

import type { AllSeafrontGroup, SeafrontGroup } from '@constants/seafront'

type PriorNotificationListProps = Readonly<{
  isFromUrl: boolean
}>
export function PriorNotificationList({ isFromUrl }: PriorNotificationListProps) {
  const lastFetchStartDateRef = useRef<number | undefined>(undefined)
  const { forceUpdate } = useForceUpdate()

  const dispatch = useMainAppDispatch()
  const listFilter = useMainAppSelector(state => state.priorNotification.listFilterValues)
  const openedPriorNotificationComponentType = useMainAppSelector(
    state => state.priorNotification.openedPriorNotificationComponentType
  )
  const openedPriorNotificationDetail = useMainAppSelector(
    state => state.priorNotification.openedPriorNotificationDetail
  )
  const openedReportingListVesselIdentity = useMainAppSelector(
    state => state.priorNotification.openedReportingListVesselIdentity
  )
  const isSuperUser = useIsSuperUser()

  const [rowSelection, setRowSelection] = useState({})
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [lastFetchDuration, setLastFetchDuration] = useState<number | undefined>(undefined)

  const { apiPaginationParams, reactTablePaginationState, setReactTablePaginationState } = useListPagination(
    DEFAULT_PAGE_SIZE,
    listFilter
  )
  const { apiSortingParams, reactTableSortingState, setReactTableSortingState } = useListSorting<Logbook.ApiSortColumn>(
    Logbook.ApiSortColumn.EXPECTED_ARRIVAL_DATE,
    BackendApi.SortDirection.DESC
  )

  const rtkQueryParams = {
    apiPaginationParams,
    apiSortingParams,
    listFilter
  }
  // `!!error` !== `isError` because `isError` is `false` when the query is fetching.
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

  const { data: priorNotificationToVerify } = useGetPriorNotificationsToVerifyQuery(
    isSuperUser ? undefined : skipToken,
    {
      ...RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS,
      ...RTK_FORCE_REFETCH_QUERY_OPTIONS
    }
  )

  const loadingState = useLoadingState(isFetching, { apiSortingParams, listFilter }, apiPaginationParams)
  const isBodyLoaderVisible = loadingState.isLoadingNewPage || (loadingState.isReloading && !!error)
  const isBodyEmptyDataVisible = !isBodyLoaderVisible && !!priorNotifications && priorNotifications.length === 0
  const previousListFilter = usePrevious(listFilter)
  const title = getTitle(listFilter.seafrontGroup)

  useEffect(() => {
    /**
     * We need this force update for the side window to re-render
     * 95% of all transactions are done under 2 seconds (from duration percentiles in sentry)
     * */
    if (loadingState.isLoadingNewPage || loadingState.isLoadingNextPage) {
      forceUpdate(2000)
    }
  }, [loadingState.isLoadingNewPage, loadingState.isLoadingNextPage, forceUpdate])

  const handleSubMenuChange = useCallback(
    (nextSeafrontGroup: SeafrontGroup | AllSeafrontGroup) => {
      dispatch(priorNotificationActions.setListFilterValues({ seafrontGroup: nextSeafrontGroup }))
    },
    [dispatch]
  )

  const subMenuCounter = useCallback(
    (seafrontGroup: SeafrontGroup | AllSeafrontGroup): number => extraData?.perSeafrontGroupCount[seafrontGroup] ?? 0,
    [extraData]
  )

  const subMenuBadgeCounter = useCallback(
    (seafrontGroup: SeafrontGroup | AllSeafrontGroup): number | undefined =>
      priorNotificationToVerify?.perSeafrontGroupCount[seafrontGroup],
    [priorNotificationToVerify]
  )

  const columns = useMemo(
    () =>
      isBodyLoaderVisible
        ? getTableColumns(isFromUrl).map(column => ({ ...column, cell: SkeletonRow }))
        : getTableColumns(isFromUrl),
    [isBodyLoaderVisible, isFromUrl]
  )

  const tableData = useMemo(
    () => (isBodyLoaderVisible ? Array(8).fill({}) : (priorNotifications ?? [])),
    [isBodyLoaderVisible, priorNotifications]
  )

  const table = useReactTable({
    columns,
    data: tableData,
    enableRowSelection: true,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getRowId: row => row.reportId,
    manualPagination: true,
    manualSorting: true,
    onExpandedChange: nexState => {
      trackEvent({
        action: "Ouverture/fermeture d'une ligne de préavis",
        category: 'PNO',
        name: isSuperUser ? 'CNSP' : 'EXT'
      })
      setExpanded(nexState)
    },
    onPaginationChange: setReactTablePaginationState,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setReactTableSortingState,
    rowCount: totalLength ?? 0,
    state: {
      expanded,
      pagination: reactTablePaginationState,
      rowSelection,
      sorting: reactTableSortingState
    }
  })

  const { rows } = table.getRowModel()

  useEffect(() => {
    if (previousListFilter !== listFilter) {
      table.resetExpanded()
    }
  }, [previousListFilter, listFilter, table])

  useEffect(() => {
    if (isFetching) {
      lastFetchStartDateRef.current = Date.now()

      return
    }

    if (lastFetchStartDateRef.current) {
      const nextLastFetchDuration = Date.now() - lastFetchStartDateRef.current
      const TEN_SECONDS = 10

      if (nextLastFetchDuration / 1000 > TEN_SECONDS) {
        captureMessage('Display of PNO list took more than 10 seconds.', {
          extra: {
            params: rtkQueryParams,
            waitTime: nextLastFetchDuration / 1000
          }
        })
      }

      setLastFetchDuration(nextLastFetchDuration)
    }
    // We do no want to trigger useEffect on `rtkQueryParams` changes but only on `isFetching`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching])

  return (
    <>
      <SubMenu
        badgeCounter={subMenuBadgeCounter}
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
                isBodyLoaderVisible || isError || totalLength === undefined ? '...' : totalLength
              } préavis (tous les horaires sont en UTC) en ${isBodyLoaderVisible || isError || lastFetchDuration === undefined ? '...' : `${lastFetchDuration / 1000}s`}`}</TableLegend>

              {isSuperUser && (
                <Button
                  accent={Accent.PRIMARY}
                  Icon={Icon.Plus}
                  onClick={() => dispatch(openManualPriorNotificationForm(undefined))}
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

                  {isBodyEmptyDataVisible && <TableBodyEmptyData />}
                  {!isBodyEmptyDataVisible && (
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
              <LoadMore accent={Accent.SECONDARY} disabled>
                Chargement en cours...
              </LoadMore>
            )}
            {!isError &&
              !loadingState.isLoadingNewPage &&
              !loadingState.isLoadingNextPage &&
              table.getCanNextPage() && (
                <LoadMore accent={Accent.SECONDARY} onClick={table.nextPage}>
                  {`Charger les ${Math.min(
                    totalLength! - priorNotifications!.length,
                    DEFAULT_PAGE_SIZE
                  )} préavis suivants`}
                </LoadMore>
              )}
          </TableOuterWrapper>
        </Body>
      </Page>

      {openedPriorNotificationComponentType === OpenedPriorNotificationType.LogbookForm && (
        <LogbookPriorNotificationForm />
      )}
      {openedPriorNotificationComponentType === OpenedPriorNotificationType.ManualForm && (
        <ManualPriorNotificationForm key={openedPriorNotificationDetail?.fingerprint} />
      )}
      {openedReportingListVesselIdentity && <ReportingList />}
    </>
  )
}

const LoadMore = styled(Button)`
  margin-top: 8px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
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
