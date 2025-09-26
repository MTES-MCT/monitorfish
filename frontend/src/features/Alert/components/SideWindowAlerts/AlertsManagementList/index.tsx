import { ConfirmationModal } from '@components/ConfirmationModal'
import { ErrorWall } from '@components/ErrorWall'
import {
  useGetAllAlertSpecificationsQuery,
  useActivateAlertMutation,
  useDeactivateAlertMutation,
  useDeleteAlertMutation
} from '@features/Alert/apis'
import { HowAlertsWorksDialog } from '@features/Alert/components/HowAlertsWorksDialog'
import { getTableColumns } from '@features/Alert/components/SideWindowAlerts/AlertsManagementList/columns'
import { DEFAULT_EDITED_ALERT_SPECIFICATION } from '@features/Alert/components/SideWindowAlerts/constants'
import { alertActions } from '@features/Alert/components/SideWindowAlerts/slice'
import { PageWithUnderlineTitle } from '@features/SideWindow/components/PageWithUnderlineTitle'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import {
  Button,
  CustomSearch,
  FulfillingBouncingCircleLoader,
  Icon,
  LinkButton,
  pluralize,
  Size,
  TableWithSelectableRows,
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
import { useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

import { Row } from './Row'

import type { AlertSpecification } from '@features/Alert/types'

export function AlertsManagementList() {
  const dispatch = useMainAppDispatch()
  const { data: alertSpecifications, error, isLoading: isFetchingAlerts } = useGetAllAlertSpecificationsQuery()
  const [activateAlert, { isLoading: isActivatingAlert }] = useActivateAlertMutation()
  const [deactivateAlert, { isLoading: isDeactivatingAlert }] = useDeactivateAlertMutation()
  const [deleteAlert, { isLoading: isDeletingAlert }] = useDeleteAlertMutation()
  const isLoading = isFetchingAlerts || isActivatingAlert || isDeactivatingAlert || isDeletingAlert

  const [isHowAlertsWorksDialogOpen, setIsHowAlertsWorksDialogOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>()
  const [deactivateConfirmationModal, setDeactivateConfirmationModal] = useState<{
    alertSpecification: AlertSpecification | undefined
    isOpen: boolean
  }>({ alertSpecification: undefined, isOpen: false })
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState<{
    alertSpecification: AlertSpecification | undefined
    isOpen: boolean
  }>({ alertSpecification: undefined, isOpen: false })

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

  const handleToggleConfirmation = (alertSpecification: AlertSpecification, action: 'activate' | 'deactivate') => {
    if (action === 'deactivate') {
      setDeactivateConfirmationModal({ alertSpecification, isOpen: true })

      return
    }

    // Direct activation without confirmation
    if (alertSpecification.id) {
      activateAlert(alertSpecification.id)
    }
  }

  const handleConfirmToggle = async () => {
    if (!deactivateConfirmationModal.alertSpecification?.id) {
      return
    }

    // Only deactivation needs confirmation
    await deactivateAlert(deactivateConfirmationModal.alertSpecification.id)
    setDeactivateConfirmationModal({ alertSpecification: undefined, isOpen: false })
  }

  const handleCancelToggle = () => {
    setDeactivateConfirmationModal({ alertSpecification: undefined, isOpen: false })
  }

  const handleDeleteConfirmation = (alertSpecification: AlertSpecification) => {
    setDeleteConfirmationModal({ alertSpecification, isOpen: true })
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmationModal.alertSpecification?.id) {
      return
    }

    await deleteAlert(deleteConfirmationModal.alertSpecification.id)
    setDeleteConfirmationModal({ alertSpecification: undefined, isOpen: false })
  }

  const handleCancelDelete = () => {
    setDeleteConfirmationModal({ alertSpecification: undefined, isOpen: false })
  }

  const table = useReactTable({
    columns: getTableColumns(true, handleToggleConfirmation, handleDeleteConfirmation),
    data: filteredAlertSpecifications ?? [],
    enableRowSelection: false,
    enableSorting: true,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getRowId: row => `${row.type}:${row.id}`,
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          desc: false,
          id: 'name'
        }
      ]
    },
    rowCount: filteredAlertSpecifications?.length ?? 0
  })

  const { rows } = table.getRowModel()

  const openHowAlertsWorksDialog = () => {
    setIsHowAlertsWorksDialogOpen(true)
  }

  const addAlert = () => {
    dispatch(alertActions.setEditedAlertSpecification(DEFAULT_EDITED_ALERT_SPECIFICATION))
  }

  return (
    <>
      <PageWithUnderlineTitle.Wrapper>
        <PageWithUnderlineTitle.Header>
          <PageWithUnderlineTitle.HeaderTitle>Gestion des alertes</PageWithUnderlineTitle.HeaderTitle>
          <PageWithUnderlineTitle.HeaderButtonGroup>
            <Button Icon={Icon.Plus} onClick={addAlert}>
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
          <TableOuterWrapper $isLoading={isLoading}>
            <TableTop>
              <TableLegend data-cy="alerts-specification-list-length">
                {`${filteredAlertSpecifications?.length ?? 0} ${pluralize('alerte', filteredAlertSpecifications?.length ?? 0)}`}
                {isLoading && <FulfillingBouncingCircleLoader color={THEME.color.slateGray} size={16} />}
              </TableLegend>
              <LinkButton onClick={openHowAlertsWorksDialog}>
                En savoir plus sur le fonctionnement des alertes
              </LinkButton>
            </TableTop>
            <TableInnerWrapper $hasError={!!error}>
              {!!error && <ErrorWall displayedErrorKey={DisplayedErrorKey.SIDE_WINDOW_ALERT_MANAGEMENT_ERROR} />}
              {!error && (
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
      {deactivateConfirmationModal.isOpen && deactivateConfirmationModal.alertSpecification && (
        <ConfirmationModal
          color={THEME.color.maximumRed}
          confirmationButtonLabel="Confirmer la désactivation"
          message={
            <>
              <p>
                <b>
                  Êtes-vous sûr de vouloir désactiver l&apos;alerte &quot;
                  {deactivateConfirmationModal.alertSpecification.name}&quot; ?
                </b>
              </p>
              <p>Cela stoppera toutes les occurrences futures.</p>
            </>
          }
          onCancel={handleCancelToggle}
          onConfirm={handleConfirmToggle}
          title="Désactiver l'alerte"
        />
      )}
      {deleteConfirmationModal.isOpen && deleteConfirmationModal.alertSpecification && (
        <ConfirmationModal
          color={THEME.color.maximumRed}
          confirmationButtonLabel="Confirmer la suppression"
          iconName="Delete"
          message={
            <>
              <p>
                <b>
                  Êtes-vous sûr de vouloir supprimer l&apos;alerte &quot;
                  {deleteConfirmationModal.alertSpecification.name}&quot; ?
                </b>
              </p>
              <p>
                Cela supprimera la définition et les critères de l&apos;alerte, ainsi que toutes les occurrences
                futures.
              </p>
            </>
          }
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Supprimer l'alerte"
        />
      )}
    </>
  )
}

const TableOuterWrapper = styled.div<{ $isLoading: boolean }>`
  cursor: ${p => (p.$isLoading ? 'progress' : 'unset')} !important;
  align-self: flex-start;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  * {
    box-sizing: border-box;
  }
`

const TableLegend = styled.div`
  color: ${p => p.theme.color.slateGray};
  line-height: 1;
  margin: 0;
  display: flex;
  height: 12px;

  > div {
    margin-left: 8px;
  }
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
