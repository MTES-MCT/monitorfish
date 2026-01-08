import { NO_SEAFRONT_GROUP, type NoSeafrontGroup, SeafrontGroup } from '@constants/seafront'
import { HowAlertsWorksDialog } from '@features/Alert/components/HowAlertsWorksDialog'
import { silenceAlert } from '@features/Alert/useCases/silenceAlert'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import {
  CustomSearch,
  Icon,
  LinkButton,
  pluralize,
  Size,
  TableWithSelectableRows,
  Tag,
  TextInput,
  THEME
} from '@mtes-mct/monitor-ui'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { getPendingAlertsTableColumns } from './columns'
import { PendingAlertsRow } from './PendingAlertsRow'
import { SilenceAlertMenu } from './SilenceAlertMenu'
import { ALERTS_MENU_SEAFRONT_TO_SEAFRONTS } from '../../../constants'
import { SUB_MENU_LABEL } from '../constants'
import { resetFocusOnPendingAlert } from '../slice'

import type { PendingAlert, SilencedAlertPeriodRequest } from '../../../types'
import type { MutableRefObject } from 'react'

export type PendingAlertsListProps = Readonly<{
  numberOfSilencedAlerts: number
  selectedSeafrontGroup: SeafrontGroup | NoSeafrontGroup
}>
export function PendingAlertsList({ numberOfSilencedAlerts, selectedSeafrontGroup }: PendingAlertsListProps) {
  const dispatch = useMainAppDispatch()
  const focusedPendingAlertId = useMainAppSelector(state => state.alert.focusedPendingAlertId)
  const pendingAlerts = useMainAppSelector(state => state.alert.pendingAlerts)
  const [searchQuery, setSearchQuery] = useState<string>()
  const [isHowAlertsWorksDialogOpen, setIsHowAlertsWorksDialogOpen] = useState<boolean>(false)
  const [silenceAlertMenuState, setSilenceAlertMenuState] = useState<
    { anchorElement: HTMLElement; pendingAlert: PendingAlert } | undefined
  >(undefined)
  const scrollableContainerRef = useRef() as MutableRefObject<HTMLDivElement>

  const openHowAlertsWorksDialog = () => {
    setIsHowAlertsWorksDialogOpen(true)
  }

  const openSilenceAlertMenu = useCallback((pendingAlert: PendingAlert, anchorElement: HTMLElement) => {
    setSilenceAlertMenuState({ anchorElement, pendingAlert })
  }, [])

  const closeSilenceAlertMenu = useCallback(() => {
    setSilenceAlertMenuState(undefined)
  }, [])

  const currentSeafrontAlerts = useMemo(() => {
    if (selectedSeafrontGroup === NO_SEAFRONT_GROUP) {
      return pendingAlerts.filter(pendingAlert => !pendingAlert.value.seaFront)
    }

    return pendingAlerts.filter(
      pendingAlert =>
        pendingAlert.value.seaFront &&
        (ALERTS_MENU_SEAFRONT_TO_SEAFRONTS[selectedSeafrontGroup].seafronts || []).includes(pendingAlert.value.seaFront)
    )
  }, [pendingAlerts, selectedSeafrontGroup])

  const numberOfAlertsMessage = `${numberOfSilencedAlerts} ${pluralize('suspension', numberOfSilencedAlerts)} d'${pluralize('alerte', numberOfSilencedAlerts)} en ${
    SUB_MENU_LABEL[selectedSeafrontGroup]
  }`

  const fuse = useMemo(
    () =>
      new CustomSearch(
        structuredClone(currentSeafrontAlerts),
        ['vesselName', 'internalReferenceNumber', 'externalReferenceNumber', 'ircs', 'value.name'],
        { threshold: 0.4 }
      ),
    [currentSeafrontAlerts]
  )

  const filteredAlerts = useMemo(() => {
    if (!currentSeafrontAlerts) {
      return []
    }

    if (!searchQuery || searchQuery.length <= 1) {
      return currentSeafrontAlerts
    }

    return fuse.find(searchQuery)
  }, [currentSeafrontAlerts, searchQuery, fuse])

  useEffect(() => {
    if (focusedPendingAlertId) {
      setSearchQuery(undefined)
      const timeoutHandler = setTimeout(() => {
        dispatch(resetFocusOnPendingAlert())
      }, 2000)

      return () => {
        clearTimeout(timeoutHandler)
      }
    }

    return undefined
  }, [dispatch, focusedPendingAlertId])

  const table = useReactTable({
    columns: getPendingAlertsTableColumns(openSilenceAlertMenu),
    data: filteredAlerts ?? [],
    enableRowSelection: false,
    enableSorting: true,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getRowId: row => `${row.id}`,
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          desc: true,
          id: 'creationDate'
        }
      ]
    },
    rowCount: filteredAlerts?.length ?? 0
  })

  const { rows } = table.getRowModel()

  const silenceAlertCallback = useCallback(
    (silencedAlertPeriodRequest: SilencedAlertPeriodRequest, pendingAlert: PendingAlert) => {
      dispatch(silenceAlert(silencedAlertPeriodRequest, pendingAlert))
    },
    [dispatch]
  )

  return (
    <>
      <Content>
        <StyledTextInput
          data-cy="side-window-alerts-search-vessel"
          isLabelHidden
          isSearchInput
          isTransparent
          label="Rechercher un navire ou une alerte"
          name="searchQuery"
          onChange={setSearchQuery}
          placeholder="Rechercher un navire ou une alerte"
          size={Size.LARGE}
          value={searchQuery}
        />
        <TableTop>
          <TableLegend>
            <NumberOfAlerts>{filteredAlerts.length} alertes</NumberOfAlerts>(
            <StyledLinkButton onClick={openHowAlertsWorksDialog}>
              En savoir plus sur le fonctionnement des alertes
            </StyledLinkButton>
            )
          </TableLegend>
          {numberOfSilencedAlerts > 0 && (
            <StyledTagInfo
              backgroundColor={THEME.color.goldenPoppy25}
              color={THEME.color.gunMetal}
              Icon={Icon.Info}
              iconColor={THEME.color.goldenPoppy}
              withCircleIcon
            >
              {numberOfAlertsMessage}
            </StyledTagInfo>
          )}
        </TableTop>
        <TableInnerWrapper ref={scrollableContainerRef} className="smooth-scroll" data-cy="side-window-alerts-list">
          <TableWithSelectableRows.Table>
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
                <PendingAlertsRow key={row.id} row={row} />
              ))}
            </tbody>
          </TableWithSelectableRows.Table>
          {!rows.length && <NoAlerts>Aucune alerte à vérifier</NoAlerts>}
        </TableInnerWrapper>
      </Content>
      {isHowAlertsWorksDialogOpen && <HowAlertsWorksDialog onClose={() => setIsHowAlertsWorksDialogOpen(false)} />}
      {silenceAlertMenuState !== undefined && silenceAlertMenuState !== null && (
        <SilenceAlertMenu
          anchorElement={silenceAlertMenuState.anchorElement}
          onClose={closeSilenceAlertMenu}
          pendingAlert={silenceAlertMenuState.pendingAlert}
          silenceAlert={silenceAlertCallback}
        />
      )}
    </>
  )
}

const NumberOfAlerts = styled.span`
  margin-right: 4px;
  color: ${p => p.theme.color.slateGray};
`

const StyledLinkButton = styled(LinkButton)`
  color: ${p => p.theme.color.charcoal};
`

const StyledTagInfo = styled(Tag)`
  margin-right: 0;
  margin-left: auto;
  font-weight: 500;
`

const StyledTextInput = styled(TextInput)`
  width: 310px;
`

const TableTop = styled.div`
  margin-top: 28px;
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 4px;
`

const TableLegend = styled.div`
  display: flex;
  align-items: center;

  .Element-LinkButton {
    align-items: unset;
    padding: 0;
  }
`

const TableInnerWrapper = styled.div`
  align-items: flex-start;
  height: calc(100vh - 250px); /* = window height - filters height - title height */
  overflow-x: visible;
  padding-right: 8px;
  overflow-y: scroll;

  > table {
    min-width: 1180px;
  }
`

const NoAlerts = styled.div`
  color: ${p => p.theme.color.slateGray};
  margin-top: 20px;
  text-align: center;
`

const Content = styled.div`
  padding: 32px 32px 32px 32px;
  width: fit-content;
`
