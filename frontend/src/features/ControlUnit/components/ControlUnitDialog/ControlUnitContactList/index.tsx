import { ConfirmationModal } from '@components/ConfirmationModal'
import { createOrUpdateControlUnitContact } from '@features/ControlUnit/useCases/createOrUpdateControlUnitContact'
import { mainWindowActions } from '@features/MainWindow/slice'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { FrontendApiError } from '@libs/FrontendApiError'
import { FrontendError } from '@libs/FrontendError'
import { Accent, Button, ControlUnit, Level } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { INITIAL_CONTROL_UNIT_CONTACT_FORM_VALUES } from './constants'
import { Form } from './Form'
import { Item } from './Item'
import { sortControlUnitContactsByQualifiedName } from './utils'
import { monitorenvControlUnitContactApi } from '../../../controlUnitContactApi'
import { Section } from '../shared/Section'
import { TextareaForm } from '../shared/TextareaForm'

import type { ControlUnitContactFormValues } from './types'

type ControlUnitContactListProps = {
  controlUnit: ControlUnit.ControlUnit
  onSubmit: (nextControlUnit: ControlUnit.ControlUnit) => any
}
export function ControlUnitContactList({ controlUnit, onSubmit }: ControlUnitContactListProps) {
  const dispatch = useMainAppDispatch()

  const [editedControlUnitContactId, setEditedControlUnitContactId] = useState<number | undefined>(undefined)
  const [isDeletionConfirmationModalOpen, setIsDeletionConfirmationModalOpen] = useState(false)
  const [isNewControlUnitContactFormOpen, setIsNewControlUnitContactFormOpen] = useState(false)

  const noEmailSubscriptionContactWarningBannerIdRef = useRef<number | undefined>(undefined)

  const sortedControlUnitContacts = useMemo(
    () => sortControlUnitContactsByQualifiedName(controlUnit.controlUnitContacts),
    [controlUnit.controlUnitContacts]
  )

  const editedControlUnitContact = useMemo(
    () =>
      sortedControlUnitContacts.find(({ id }) => id === editedControlUnitContactId) ?? {
        ...INITIAL_CONTROL_UNIT_CONTACT_FORM_VALUES,
        controlUnitId: controlUnit.id
      },
    [controlUnit.id, editedControlUnitContactId, sortedControlUnitContacts]
  )

  const askForDeletionConfirmation = useCallback(() => {
    setIsDeletionConfirmationModalOpen(true)
  }, [])

  const closeDialogsAndModals = useCallback(() => {
    setIsDeletionConfirmationModalOpen(false)
  }, [])

  const closeForm = useCallback(() => {
    setEditedControlUnitContactId(undefined)
    setIsNewControlUnitContactFormOpen(false)
  }, [])

  const confirmDeletion = async () => {
    if (!editedControlUnitContactId) {
      throw new FrontendError('`editedControlUnitContactId` is undefined.')
    }

    // There can only be one email subscription contact per control unit,
    // meaning that if the user is trying to delete the only email subscription contact,
    // we need to warn them that the control unit will no longer receive any email
    const controlUnitContactToDelete = controlUnit.controlUnitContacts.find(
      controlUnitContact => controlUnitContact.id === editedControlUnitContactId
    )
    if (!controlUnitContactToDelete) {
      throw new FrontendError('`deletedControlUnitContact` is undefined.')
    }
    if (controlUnitContactToDelete.isEmailSubscriptionContact) {
      noEmailSubscriptionContactWarningBannerIdRef.current = showNoEmailSubscriptionContactWarningBanner()
    }

    try {
      await dispatch(
        monitorenvControlUnitContactApi.endpoints.deleteControlUnitContact.initiate(editedControlUnitContactId)
      ).unwrap()

      closeDialogsAndModals()
      closeForm()
    } catch (err) {
      FrontendApiError.handleIfAny(err)
    }
  }

  const submit = async (controlUnitContactFormValues: ControlUnitContactFormValues) => {
    const hadAnEmailSubscriptionContact = controlUnit.controlUnitContacts.some(
      controlUnitContact => controlUnitContact.isEmailSubscriptionContact
    )
    const willHaveAnEmailSubscriptionContact =
      controlUnitContactFormValues.isEmailSubscriptionContact ||
      controlUnit.controlUnitContacts.some(
        controlUnitContact =>
          controlUnitContact.id !== controlUnitContactFormValues.id && controlUnitContact.isEmailSubscriptionContact
      )

    // There can only be one email subscription contact per control unit,
    // meaning that if the user is trying to unsubscribe the current email subscription contact,
    // we need to warn them that the control unit will no longer receive any email
    if (hadAnEmailSubscriptionContact && !willHaveAnEmailSubscriptionContact) {
      noEmailSubscriptionContactWarningBannerIdRef.current = showNoEmailSubscriptionContactWarningBanner()
    } else {
      hideNoEmailSubscriptionContactWarningBannerIfAny()
    }

    await dispatch(createOrUpdateControlUnitContact(controlUnitContactFormValues))

    closeForm()
  }

  const openCreationForm = useCallback(() => {
    setEditedControlUnitContactId(undefined)
    setIsNewControlUnitContactFormOpen(true)
  }, [])

  const openEditionForm = useCallback((nextEditedControlUnitResourceId: number) => {
    setEditedControlUnitContactId(nextEditedControlUnitResourceId)
    setIsNewControlUnitContactFormOpen(false)
  }, [])

  const hideNoEmailSubscriptionContactWarningBannerIfAny = () => {
    if (noEmailSubscriptionContactWarningBannerIdRef.current === undefined) {
      return
    }

    dispatch(mainWindowActions.removeBanner(noEmailSubscriptionContactWarningBannerIdRef.current))

    noEmailSubscriptionContactWarningBannerIdRef.current = undefined
  }

  /**
   * @returns ID of the banner that was added to the main window.
   */
  const showNoEmailSubscriptionContactWarningBanner = () =>
    dispatch(
      addMainWindowBanner({
        children:
          'Cette unité n’a actuellement plus d’adresse de diffusion. Elle ne recevra plus de préavis ni de bilan de ses activités de contrôle.',
        closingDelay: 115000,
        isClosable: true,
        isFixed: true,
        level: Level.WARNING,
        withAutomaticClosing: true
      })
    )

  return (
    <Section>
      <Section.Title>Contacts</Section.Title>
      <StyledSectionBody>
        <TextareaForm
          controlUnit={controlUnit}
          label="Modalités de contact avec l’unité"
          name="termsNote"
          onSubmit={onSubmit}
        />

        {sortedControlUnitContacts.map(controlUnitContact =>
          controlUnitContact.id === editedControlUnitContactId ? (
            <StyledEditionForm
              key={controlUnitContact.id}
              controlUnit={controlUnit}
              initialValues={editedControlUnitContact}
              onCancel={closeForm}
              onDelete={askForDeletionConfirmation}
              onSubmit={submit}
            />
          ) : (
            <Item key={controlUnitContact.id} controlUnitContact={controlUnitContact} onEdit={openEditionForm} />
          )
        )}

        {isNewControlUnitContactFormOpen ? (
          <StyledCreationForm
            controlUnit={controlUnit}
            initialValues={editedControlUnitContact}
            onCancel={closeForm}
            onSubmit={submit}
          />
        ) : (
          <div>
            <Button accent={Accent.SECONDARY} onClick={openCreationForm}>
              Ajouter un contact
            </Button>
          </div>
        )}
      </StyledSectionBody>

      {isDeletionConfirmationModalOpen && editedControlUnitContact && (
        <ConfirmationModal
          confirmationButtonLabel="Supprimer"
          message={`Êtes-vous sûr de vouloir supprimer le contact "${editedControlUnitContact.name}" ?`}
          onCancel={closeDialogsAndModals}
          onConfirm={confirmDeletion}
          title="Suppression du contact"
        />
      )}
    </Section>
  )
}

const StyledSectionBody = styled(Section.Body)`
  padding: 16px 32px 24px;

  > .Field-Textarea {
    margin-bottom: 16px;
  }
  > div:last-child {
    margin-top: 16px;
  }
`

const StyledEditionForm = styled(Form)`
  margin-top: 8px;
`

const StyledCreationForm = styled(Form)`
  margin-top: 16px;
`
