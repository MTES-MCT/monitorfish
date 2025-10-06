import { ErrorWall } from '@components/ErrorWall'
import { useGetAllAlertSpecificationsQuery } from '@features/Alert/apis'
import { HowAlertsWorksDialog } from '@features/Alert/components/HowAlertsWorksDialog'
import { getTableColumns } from '@features/Alert/components/SideWindowAlerts/AlertsManagement/columns'
import { PageWithUnderlineTitle } from '@features/SideWindow/components/PageWithUnderlineTitle'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import {
  Button,
  CustomSearch,
  Icon,
  LinkButton,
  pluralize,
  Size,
  TableWithSelectableRows,
  TextInput
} from '@mtes-mct/monitor-ui'
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

import { Row } from './Row'

export function AlertsManagement() {
  const { data: alertSpecifications, error } = useGetAllAlertSpecificationsQuery()

  const [isHowAlertsWorksDialogOpen, setIsHowAlertsWorksDialogOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>()

  const fuse = useMemo(
    () => new CustomSearch(structuredClone(alertSpecifications ?? []), ['name'], { threshold: 0.4 }),
    [alertSpecifications]
  )

  const filteredAlertSpecifications = useMemo(() => {
    if (!searchQuery || searchQuery.length <= 1) {
      return alertSpecifications
    }

    return fuse.find(searchQuery)
  }, [alertSpecifications, searchQuery, fuse])

  const table = useReactTable({
    columns: getTableColumns(true),
    data: filteredAlertSpecifications ?? [],
    enableRowSelection: true,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getRowId: row => `${row.type}:${row.id}`,
    rowCount: filteredAlertSpecifications?.length ?? 0
  })

  const { rows } = table.getRowModel()

  const openHowAlertsWorksDialog = () => {
    setIsHowAlertsWorksDialogOpen(true)
  }

  return (
    <>
      <PageWithUnderlineTitle.Wrapper>
        <PageWithUnderlineTitle.Header>
          <PageWithUnderlineTitle.HeaderTitle>Gestion des alertes</PageWithUnderlineTitle.HeaderTitle>
          <PageWithUnderlineTitle.HeaderButtonGroup>
            <Button disabled Icon={Icon.Plus} onClick={() => {}}>
              Créer une nouvelle alerte
            </Button>
          </PageWithUnderlineTitle.HeaderButtonGroup>
        </PageWithUnderlineTitle.Header>

        <PageWithUnderlineTitle.Body>
          <StyledInput
            isLabelHidden
            isSearchInput
            isTransparent
            label="Rechercher une alerte"
            name="searchQuery"
            onChange={setSearchQuery}
            placeholder="Rechercher un alerte"
            size={Size.LARGE}
            value={searchQuery}
          />
          <TableOuterWrapper>
            <TableTop>
              <TableLegend data-cy="alerts-specification-list-length">
                {`${filteredAlertSpecifications?.length ?? 0} ${pluralize('alerte', filteredAlertSpecifications?.length ?? 0)}`}
              </TableLegend>
              <LinkButton onClick={openHowAlertsWorksDialog}>
                En savoir plus sur le fonctionnement des alertes
              </LinkButton>
            </TableTop>
            <TableInnerWrapper $hasError={!!error}>
              {!!error && <ErrorWall displayedErrorKey={DisplayedErrorKey.SIDE_WINDOW_ALERT_MANAGEMENT_ERROR} />}
              {!error && (
                <TableWithSelectableRows.Table $withRowCheckbox>
                  <TableWithSelectableRows.Head>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <TableWithSelectableRows.Th key={header.id} $width={header.column.getSize()}>
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
              )}
            </TableInnerWrapper>
          </TableOuterWrapper>
        </PageWithUnderlineTitle.Body>
      </PageWithUnderlineTitle.Wrapper>
      {isHowAlertsWorksDialogOpen && <HowAlertsWorksDialog onClose={() => setIsHowAlertsWorksDialogOpen(false)} />}
    </>
  )
}

const TableOuterWrapper = styled.div`
  align-self: flex-start;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  * {
    box-sizing: border-box;
  }
`

const TableLegend = styled.p`
  color: ${p => p.theme.color.slateGray};
  line-height: 1;
  margin: 0;
`

const TableTop = styled.div`
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
  margin: 8px 8px 8px 0;
`

const StyledInput = styled(TextInput)`
  width: 416px;
  margin-bottom: 32px;
`

const TableInnerWrapper = styled.div<{
  $hasError: boolean
}>`
  align-items: flex-start;
  height: calc(100vh - 250px); /* = window height - filters height - title height */
  min-width: 1205px; /* = table width + right padding + scrollbar width (8px) */
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
