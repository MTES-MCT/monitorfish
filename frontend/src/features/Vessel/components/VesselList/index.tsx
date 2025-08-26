import { Body } from '@features/SideWindow/components/Body'
import { ExportVesselListDialog } from '@features/Vessel/components/ExportVesselListDialog'
import { DEFAULT_VESSEL_LIST_FILTER_VALUES } from '@features/Vessel/components/VesselList/constants'
import { useGetFilteredVesselsLastPositions } from '@features/Vessel/hooks/useGetFilteredVesselsLastPositions'
import { filterVessels } from '@features/Vessel/useCases/VesselListV2/filterVessels'
import { previewVessels } from '@features/Vessel/useCases/VesselListV2/previewVessels'
import { EditFixedVesselGroupDialog } from '@features/VesselGroup/components/EditFixedVesselGroupDialog'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useTableVirtualizer } from '@hooks/useTableVirtualizer'
import { trackEvent } from '@hooks/useTracking'
import {
  Accent,
  Button,
  Dropdown,
  Icon,
  IconButton,
  pluralize,
  TableWithSelectableRows,
  useNewWindow,
  usePrevious
} from '@mtes-mct/monitor-ui'
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
import { EditDynamicVesselGroupDialog } from 'features/VesselGroup/components/EditDynamicVesselGroupDialog'
import { useEffect, useMemo, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import { getTableColumns, vesselListActionColumn } from './columns'
import { FilterBar } from './FilterBar'
import { FilterTags } from './FilterTags'
import { Row } from './Row'
import { TableBodyEmptyData } from './TableBodyEmptyData'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { SkeletonRow } from '../../../../ui/Table/SkeletonRow'

type VesselListProps = Readonly<{
  isFromUrl: boolean
}>
export function VesselList({ isFromUrl }: VesselListProps) {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const { newWindowContainerRef } = useNewWindow()
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const vessels = useGetFilteredVesselsLastPositions()
  const listFilter = useMainAppSelector(state => state.vessel.listFilterValues)
  const isFilteringVesselList = useMainAppSelector(state => state.vessel.isFilteringVesselList)
  const areFiltersDisplayed = useMainAppSelector(store => store.vesselList.areFiltersDisplayed)

  const previousListFilter = usePrevious(listFilter)
  const isBodyEmptyDataVisible = !!vessels && vessels.length === 0

  const [rowSelection, setRowSelection] = useState({})
  const hasNoRowsSelected = Object.keys(rowSelection).length === 0
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [isExportVesselListDialogOpened, setIsExportVesselListDialogOpened] = useState(false)
  const [isEditDynamicVesselGroupOpened, setIsEditDynamicVesselGroupOpened] = useState(false)
  const [isEditFixedVesselGroupOpened, setIsEditFixedVesselGroupOpened] = useState(false)

  const [columns, tableData] = useMemo(
    () => [
      isFilteringVesselList
        ? getTableColumns(isFromUrl, vesselListActionColumn).map(column => ({ ...column, cell: SkeletonRow }))
        : getTableColumns(isFromUrl, vesselListActionColumn),
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
        name: isSuperUser ? 'CNSP' : 'EXT'
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
    if (!areFiltersDisplayed) {
      return 0
    }

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
      <StyledBody>
        <FilterBar />
        <StyledFilterTags
          areMoreFiltersDisplayable
          className="vessel-list-filter-tags"
          listFilterValues={listFilter}
          onFilter={nextListFilterValues => dispatch(filterVessels(nextListFilterValues))}
          onReset={() => dispatch(filterVessels(DEFAULT_VESSEL_LIST_FILTER_VALUES))}
        />
        <TableOuterWrapper $isFromUrl={isFromUrl}>
          <TableTop $isFromUrl={isFromUrl}>
            <TableLegend data-cy="vessel-list-length">
              {`${
                isFilteringVesselList || tableData.length === undefined ? '...' : tableData.length
              } ${pluralize('navire', tableData.length)}`}
            </TableLegend>
            <RightButton
              accent={Accent.SECONDARY}
              disabled={hasNoRowsSelected}
              Icon={Icon.Download}
              onClick={() => setIsExportVesselListDialogOpened(true)}
              title="Télécharger la liste des navires"
            />
            <Dropdown Icon={Icon.Vessel} title="Créer un groupe de navires">
              <StyledDropdownItem
                onClick={() => setIsEditFixedVesselGroupOpened(true)}
                title="Un groupe de navires fixe est constitué des navires sélectionnés manuellement, soit directement dans la liste, soit en chargeant un fichier. Vous pouvez le mettre à jour (suppression ou ajouts de navires) également de façon manuelle."
              >
                Créer un groupe fixe <Icon.Info size={17} />
              </StyledDropdownItem>
              <StyledDropdownItem
                onClick={() => setIsEditDynamicVesselGroupOpened(true)}
                title="Un groupe de navires dynamique est constitué des navires répondant aux critères des filtres que vous aurez sélectionné. Il se met automatiquement à jour selon l'évolution des données des navires."
              >
                Créer un groupe dynamique <Icon.Info size={17} />
              </StyledDropdownItem>
            </Dropdown>
            <PreviewButton
              accent={Accent.SECONDARY}
              data-cy="preview-filtered-vessels"
              Icon={Icon.ViewOnMap}
              onClick={() => dispatch(previewVessels())}
              title="Afficher sur la carte les navires pour une capture d'écran"
            >
              Aperçu sur la carte
            </PreviewButton>
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
      {isExportVesselListDialogOpened && (
        <ExportVesselListDialog onExit={() => setIsExportVesselListDialogOpened(false)} selectedRows={rowSelection} />
      )}
      {isEditDynamicVesselGroupOpened && (
        <EditDynamicVesselGroupDialog
          initialListFilterValues={listFilter}
          onExit={() => setIsEditDynamicVesselGroupOpened(false)}
        />
      )}
      {isEditFixedVesselGroupOpened && (
        <EditFixedVesselGroupDialog
          onExit={() => setIsEditFixedVesselGroupOpened(false)}
          selectedVesselFeatureIds={Object.keys(rowSelection)}
        />
      )}
    </>
  )
}

const StyledFilterTags = styled(FilterTags)`
  margin-left: 16px;
  margin-right: 16px;
  margin-bottom: 16px;
`

const StyledBody = styled(Body)`
  padding-top: 16px;
  padding-left: 16px;
  padding-bottom: 0;
`

const StyledDropdownItem = styled(Dropdown.Item)`
  padding: 9px 10px 9px 10px;

  .Element-IconBox {
    margin-left: 9px;
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
  margin: 8px 8px 8px 0;
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
  height: ${p => `calc(100vh - ${p.$filterHeight}px - 200px)`}; /* = window height - filters height - title height */
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

const RightButton = styled(IconButton)`
  margin-left: auto;
  margin-right: 8px;

  svg {
    width: 18px;
    height: 18px;
  }
`

const PreviewButton = styled(Button)`
  margin-left: 8px;
  svg {
    width: 16px;
    height: 16px;
  }
`
