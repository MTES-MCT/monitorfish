// import styled from 'styled-components'

import { Accent, Button, ControlUnit, Icon, THEME, isEmptyish } from '@mtes-mct/monitor-ui'
import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { INITIAL_CONTROL_UNIT_RESOURCE_FORM_VALUES } from './constants'
import { Form } from './Form'
import { Item } from './Item'
import {
  DELETE_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE,
  monitorenvControlUnitResourceApi,
  useCreateControlUnitResourceMutation,
  useUpdateControlUnitResourceMutation
} from '../../../../../api/controlUnitResource'
import { ConfirmationModal } from '../../../../../components/ConfirmationModal'
import { Dialog } from '../../../../../components/Dialog'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { FrontendError } from '../../../../../libs/FrontendError'
import { isNotArchived } from '../../../../../utils/isNotArchived'
import { Section } from '../shared/Section'

import type { ControlUnitResourceFormValues } from './types'

type ControlUnitResourceListProps = {
  controlUnit: ControlUnit.ControlUnit
}
export function ControlUnitResourceList({ controlUnit }: ControlUnitResourceListProps) {
  const dispatch = useMainAppDispatch()
  const [createControlUnitResource] = useCreateControlUnitResourceMutation()
  const [updateControlUnitResource] = useUpdateControlUnitResourceMutation()

  const [editedControlUnitResourceId, setEditedControlUnitResourceId] = useState<number | undefined>(undefined)
  const [isArchivingConfirmationModalOpen, setIsArchivingConfirmationModalOpen] = useState(false)
  const [isDeletionConfirmationModalOpen, setIsDeletionConfirmationModalOpen] = useState(false)
  const [isImpossibleDeletionDialogOpen, setIsImpossibleDeletionDialogOpen] = useState(false)
  const [isNewControlUnitResourceFormOpen, setIsNewControlUnitResourceFormOpen] = useState(false)

  const activeControlUnitResources = controlUnit.controlUnitResources.filter(isNotArchived)
  const editedControlUnitResource = activeControlUnitResources.find(({ id }) => id === editedControlUnitResourceId) || {
    ...INITIAL_CONTROL_UNIT_RESOURCE_FORM_VALUES,
    controlUnitId: controlUnit.id
  }

  const askForArchivingConfirmation = useCallback(() => {
    setIsArchivingConfirmationModalOpen(true)
  }, [])

  const askForDeletionConfirmation = useCallback(async () => {
    if (!editedControlUnitResourceId) {
      throw new FrontendError('`editedControlUnitResourceId` is undefined.')
    }

    const { data: canDeleteControlUnit } = await dispatch(
      monitorenvControlUnitResourceApi.endpoints.canDeleteControlUnitResource.initiate(editedControlUnitResourceId, {
        forceRefetch: true
      })
    )
    if (!canDeleteControlUnit) {
      setIsImpossibleDeletionDialogOpen(true)

      return
    }

    setIsDeletionConfirmationModalOpen(true)
  }, [dispatch, editedControlUnitResourceId])

  const closeDialogsAndModals = useCallback(() => {
    setIsArchivingConfirmationModalOpen(false)
    setIsDeletionConfirmationModalOpen(false)
    setIsImpossibleDeletionDialogOpen(false)
  }, [])

  const closeForm = useCallback(() => {
    setEditedControlUnitResourceId(undefined)
    setIsNewControlUnitResourceFormOpen(false)
  }, [])

  const confirmArchiving = useCallback(async () => {
    if (!editedControlUnitResourceId) {
      throw new FrontendError('`editedControlUnitResourceId` is undefined.')
    }

    await dispatch(
      monitorenvControlUnitResourceApi.endpoints.archiveControlUnitResource.initiate(editedControlUnitResourceId)
    )

    closeDialogsAndModals()
    closeForm()
  }, [closeDialogsAndModals, closeForm, dispatch, editedControlUnitResourceId])

  const confirmDeletion = useCallback(async () => {
    if (!editedControlUnitResourceId) {
      throw new FrontendError('`editedControlUnitResourceId` is undefined.')
    }

    await dispatch(
      monitorenvControlUnitResourceApi.endpoints.deleteControlUnitResource.initiate(editedControlUnitResourceId)
    )

    closeDialogsAndModals()
    closeForm()
  }, [closeDialogsAndModals, closeForm, dispatch, editedControlUnitResourceId])

  const createOrUpdateControlUnitResource = useCallback(
    async (controlUnitResourceFormValues: ControlUnitResourceFormValues) => {
      const controlledControlUnitResourceFormValues = {
        ...controlUnitResourceFormValues,
        // We set the resource type as the resource name if no name has been provided by the user
        name: isEmptyish(controlUnitResourceFormValues.name)
          ? ControlUnit.ControlUnitResourceTypeLabel[controlUnitResourceFormValues.type as string]
          : controlUnitResourceFormValues.name
      }

      if (isNewControlUnitResourceFormOpen) {
        await createControlUnitResource(
          controlledControlUnitResourceFormValues as ControlUnit.NewControlUnitResourceData
        )
      } else {
        await updateControlUnitResource(controlledControlUnitResourceFormValues as ControlUnit.ControlUnitResourceData)
      }

      closeForm()
    },
    [closeForm, createControlUnitResource, isNewControlUnitResourceFormOpen, updateControlUnitResource]
  )

  const openCreationForm = useCallback(() => {
    setEditedControlUnitResourceId(undefined)
    setIsNewControlUnitResourceFormOpen(true)
  }, [])

  const openEditionForm = useCallback((nextEditedControlUnitResourceId: number) => {
    setEditedControlUnitResourceId(nextEditedControlUnitResourceId)
    setIsNewControlUnitResourceFormOpen(false)
  }, [])

  return (
    <Section>
      <Section.Title>Moyens</Section.Title>
      <StyledSectionBody $isEmpty={!activeControlUnitResources.length}>
        {activeControlUnitResources.map((controlUnitResource, index) =>
          controlUnitResource.id === editedControlUnitResourceId ? (
            <StyledEditionForm
              key={controlUnitResource.id}
              $isFirst={index === 0}
              initialValues={editedControlUnitResource}
              onArchive={askForArchivingConfirmation}
              onCancel={closeForm}
              onDelete={askForDeletionConfirmation}
              onSubmit={createOrUpdateControlUnitResource}
            />
          ) : (
            <Item key={controlUnitResource.id} controlUnitResource={controlUnitResource} onEdit={openEditionForm} />
          )
        )}

        {isNewControlUnitResourceFormOpen ? (
          <StyledCreationForm
            initialValues={editedControlUnitResource}
            onCancel={closeForm}
            onSubmit={createOrUpdateControlUnitResource}
          />
        ) : (
          <div>
            <Button accent={Accent.SECONDARY} Icon={Icon.Plus} onClick={openCreationForm}>
              Ajouter un moyen
            </Button>
          </div>
        )}
      </StyledSectionBody>

      {isArchivingConfirmationModalOpen && editedControlUnitResource && (
        <ConfirmationModal
          confirmationButtonLabel="Archiver"
          message={`Êtes-vous sûr de vouloir archiver le moyen "${editedControlUnitResource.name}" ?`}
          onCancel={closeDialogsAndModals}
          onConfirm={confirmArchiving}
          title="Archivage du moyen"
        />
      )}

      {isDeletionConfirmationModalOpen && editedControlUnitResource && (
        <ConfirmationModal
          confirmationButtonLabel="Supprimer"
          message={`Êtes-vous sûr de vouloir supprimer le moyen "${editedControlUnitResource.name}" ?`}
          onCancel={closeDialogsAndModals}
          onConfirm={confirmDeletion}
          title="Suppression du moyen"
        />
      )}

      {isImpossibleDeletionDialogOpen && (
        <Dialog
          color={THEME.color.maximumRed}
          message={DELETE_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE}
          onClose={closeDialogsAndModals}
          title="Suppression impossible"
          titleBackgroundColor={THEME.color.maximumRed}
        />
      )}
    </Section>
  )
}

const StyledSectionBody = styled(Section.Body)<{
  $isEmpty: boolean
}>`
  padding: 24px 32px;

  > div:not(:first-child) {
    margin-top: 8px;
  }
  > div:last-child {
    margin-top: ${p => (!p.$isEmpty ? 16 : 0)}px;
  }
`

const StyledEditionForm = styled(Form)<{
  $isFirst: boolean
}>`
  margin-top: ${p => (p.$isFirst ? 0 : 8)}px;
`

const StyledCreationForm = styled(Form)`
  margin-top: 16px;
`
