import { Body } from '@features/SideWindow/components/Body'
import { Header } from '@features/SideWindow/components/Header'
import { Page } from '@features/SideWindow/components/Page'
import { useGetFilteredVesselsLastPositions } from '@features/Vessel/hooks/useGetFilteredVesselsLastPositions'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useTableVirtualizer } from '@hooks/useTableVirtualizer'
import { trackEvent } from '@hooks/useTracking'
import { Icon, pluralize, TableWithSelectableRows, useNewWindow, usePrevious } from '@mtes-mct/monitor-ui'
import {
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { notUndefined } from '@tanstack/react-virtual'
import { assertNotNullish } from '@utils/assertNotNullish'
import { isLegacyFirefox } from '@utils/isLegacyFirefox'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import { getTableColumns } from './columns'
import { FilterBar } from './FilterBar'
import { FilterTags } from './FilterTags'
import { Row } from './Row'
import { TableBodyEmptyData } from './TableBodyEmptyData'
import { UserAccountContext } from '../../../../context/UserAccountContext'
import { SkeletonRow } from '../../../../ui/Table/SkeletonRow'

type VesselListProps = Readonly<{
  isFromUrl: boolean
}>
export function VesselList({ isFromUrl }: VesselListProps) {
  const userAccount = useContext(UserAccountContext)
  const { newWindowContainerRef } = useNewWindow()
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const vessels = useGetFilteredVesselsLastPositions()
  const listFilter = useMainAppSelector(state => state.vessel.listFilterValues)
  const isFilteringVesselList = useMainAppSelector(state => state.vessel.isFilteringVesselList)

  const previousListFilter = usePrevious(listFilter)
  const isBodyEmptyDataVisible = !!vessels && vessels.length === 0

  const [rowSelection, setRowSelection] = useState({})
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const [columns, tableData] = useMemo(
    () => [
      isFilteringVesselList
        ? getTableColumns(isFromUrl).map(column => ({ ...column, cell: SkeletonRow }))
        : getTableColumns(isFromUrl),
      isFilteringVesselList ? Array(8).fill({}) : (vessels ?? [])
    ],
    [isFilteringVesselList, isFromUrl, vessels]
  )

  /**
   * TODO Use a web worker to compute sorting, i.e :
   *
   * monitorFishWorker.sortTable(vessels, sorting).then((sortedData) => {
   *       setTableData(sortedData)
   *       setIsSorting(false)
   *     })
   ** */

  const table = useReactTable({
    columns,
    data: tableData,
    enableRowSelection: true,
    enableSortingRemoval: true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getRowId: row => row.vesselFeatureId,
    getSortedRowModel: getSortedRowModel(),
    onExpandedChange: nexState => {
      trackEvent({
        action: "Ouverture/fermeture d'une ligne de la liste des navires",
        category: 'VESSEL_LIST',
        name: userAccount?.email ?? ''
      })
      setExpanded(nexState)
    },
    onRowSelectionChange: setRowSelection,
    rowCount: tableData?.length ?? 0,
    state: {
      expanded,
      rowSelection
    }
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
  const filterHeight = (function () {
    const filterBarHeight =
      newWindowContainerRef.current?.getElementsByClassName('vessel-list-filter-bar')?.[0]?.clientHeight ?? 0
    const filterTagsHeight =
      newWindowContainerRef.current?.getElementsByClassName('vessel-list-filter-tags')?.[0]?.clientHeight ?? 0

    return filterBarHeight + filterTagsHeight
  })()

  useEffect(() => {
    if (previousListFilter !== listFilter) {
      table.resetExpanded()
    }
  }, [previousListFilter, listFilter, table])

  return (
    <>
      <Page>
        <Header>
          <StyledTitle>
            <Icon.VesselList size={26} /> Tous les navires
          </StyledTitle>
        </Header>

        <StyledBody>
          <FilterBar />
          <FilterTags />

          <TableOuterWrapper $isFromUrl={isFromUrl}>
            <TableTop $isFromUrl={isFromUrl}>
              <TableLegend data-cy="vessel-list-length">{`${
                isFilteringVesselList || tableData.length === undefined ? '...' : tableData.length
              } ${pluralize('navire', tableData.length)} ${pluralize('équipé', tableData.length)} VMS `}</TableLegend>
            </TableTop>

            <TableInnerWrapper ref={tableContainerRef} $filterHeight={filterHeight} $hasError={false}>
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
                {paddingBeforeRows > 0 && (
                  <tr>
                    <td aria-label="padding before" colSpan={columns.length} style={{ height: paddingBeforeRows }} />
                  </tr>
                )}
                {!isBodyEmptyDataVisible && (
                  <tbody>
                    {virtualRows.map(virtualRow => {
                      const row = rows[virtualRow?.index]
                      assertNotNullish(row)

                      return (
                        <Row
                          key={virtualRow.key}
                          ref={node => rowVirtualizer?.measureElement(node)}
                          index={virtualRow?.index}
                          row={row}
                        />
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
            </TableInnerWrapper>
          </TableOuterWrapper>
        </StyledBody>
      </Page>
    </>
  )
}

const StyledBody = styled(Body)`
  padding-top: 16px;
  padding-left: 16px;
  padding-bottom: 0;
`

const StyledTitle = styled(Header.Title)`
  span:first-of-type {
    vertical-align: sub;
  }
`

const TableOuterWrapper = styled.div<{
  $isFromUrl: boolean
}>`
  align-self: flex-start;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin-left: 16px;

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
  $filterHeight: number
  $hasError: boolean
}>`
  align-items: flex-start;
  height: ${p => `calc(100vh - ${p.$filterHeight}px - 175px)`}; /* = window height - filters height - title height */
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
