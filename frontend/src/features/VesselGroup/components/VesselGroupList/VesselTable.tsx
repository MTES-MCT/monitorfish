import { Body } from '@features/SideWindow/components/Body'
import { getTableColumns } from '@features/Vessel/components/VesselList/columns'
import { Row } from '@features/Vessel/components/VesselList/Row'
import { Vessel } from '@features/Vessel/Vessel.types'
import { getVesselGroupActionColumn } from '@features/VesselGroup/components/VesselGroupList/columns'
import { Icon, TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

import { TableBodyEmptyData } from './TableBodyEmptyData'

type VesselTableProps = Readonly<{
  isFixedGroup: boolean
  isFromUrl: boolean
  isPinned: boolean
  vesselGroupId: number
  vessels: Vessel.VesselLastPosition[]
}>
export function VesselTable({ isFixedGroup, isFromUrl, isPinned, vesselGroupId, vessels }: VesselTableProps) {
  const isBodyEmptyDataVisible = !!vessels && vessels.length === 0

  const [rowSelection, setRowSelection] = useState({})

  const [columns, tableData] = useMemo(
    () => [getTableColumns(isFromUrl, getVesselGroupActionColumn(vesselGroupId, isFixedGroup)), vessels ?? []],
    [isFromUrl, vesselGroupId, isFixedGroup, vessels]
  )

  const table = useReactTable({
    columns,
    data: tableData,
    enableRowSelection: true,
    enableSortingRemoval: true,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.vesselFeatureId,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    rowCount: tableData?.length ?? 0,
    state: {
      rowSelection
    }
  })

  const { rows } = table.getRowModel()

  return (
    <>
      <StyledBody>
        <TableOuterWrapper>
          <TableInnerWrapper $hasError={false} $hasWhiteBackground={isPinned} $numberOfItems={rows.length}>
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
                  {rows.map(row => {
                    assertNotNullish(row)

                    return <Row key={row.id} hasWhiteBackground={isPinned} index={row?.index} row={row} />
                  })}
                </tbody>
              )}
            </TableWithSelectableRows.Table>
          </TableInnerWrapper>
        </TableOuterWrapper>
      </StyledBody>
    </>
  )
}

const StyledBody = styled(Body)`
  padding-top: 16px;
  padding-left: 0;
  padding-bottom: 0;
`

const TableOuterWrapper = styled.div`
  align-self: flex-start;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin-left: 0;

  * {
    box-sizing: border-box;
  }
`

const TableInnerWrapper = styled.div<{
  $hasError: boolean
  $hasWhiteBackground: boolean
  $numberOfItems: number
}>`
  align-items: flex-start;
  height: ${p => {
    if (p.$numberOfItems === 0) {
      return 160
    }

    if (p.$numberOfItems > 7) {
      return 400
    }

    return 47 * (p.$numberOfItems + 1)
  }}px;
  min-width: 1407px; /* = table width + right padding + scrollbar width (8px) */
  padding-right: 8px;
  overflow-y: scroll;
  width: auto;
  th {
    background: ${p => (p.$hasWhiteBackground ? p.theme.color.cultured : p.theme.color.white)};
  }

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
