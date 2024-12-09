import { ConfirmationModal } from '@components/ConfirmationModal'
import { SideWindowCard } from '@components/SideWindowCard'
import { CurrentReportingList } from '@features/Reporting/components/CurrentReportingList'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, LinkButton } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useIsSuperUser } from 'auth/hooks/useIsSuperUser'
import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { priorNotificationActions } from '../slice'
import { CardHeader } from './shared/CardHeader'

export function ReportingList() {
  const dispatch = useMainAppDispatch()
  const isPriorNotificationCardOpened = useMainAppSelector(
    store => !!store.priorNotification.openedPriorNotificationComponentType
  )
  const isReportingFormDirty = useMainAppSelector(store => store.priorNotification.isReportingFormDirty)
  const vesselIdentity = useMainAppSelector(store => store.priorNotification.openedReportingListVesselIdentity)
  assertNotNullish(vesselIdentity)
  const isSuperUser = useIsSuperUser()

  const [isCancellationConfirmationModalOpen, setIsCancellationConfirmationModalOpen] = useState(false)

  const close = () => {
    dispatch(priorNotificationActions.closeReportingList())
  }

  const closeCancellationConfirmationModal = () => {
    setIsCancellationConfirmationModalOpen(false)
  }

  const handleClose = () => {
    if (isReportingFormDirty) {
      setIsCancellationConfirmationModalOpen(true)

      return
    }

    close()
  }

  const handleIsDirty = useCallback(
    (isDirty: boolean) => {
      dispatch(priorNotificationActions.setIsReportingFormDirty(isDirty))
    },
    [dispatch]
  )

  return (
    <>
      <StyledCard $isSuperUser={isSuperUser} onBackgroundClick={handleClose}>
        <CardHeader
          onClose={handleClose}
          selectedVesselIdentity={vesselIdentity}
          withCloseButton={!isPriorNotificationCardOpened}
          withFirstTitleRow={isPriorNotificationCardOpened}
        >
          {isPriorNotificationCardOpened && (
            <StyledLinkButton Icon={Icon.Chevron} onClick={handleClose}>
              Retourner au préavis
            </StyledLinkButton>
          )}
        </CardHeader>

        <StyledCurrentReportingList
          onIsDirty={handleIsDirty}
          vesselIdentity={vesselIdentity}
          withOpenedNewReportingForm={isPriorNotificationCardOpened}
          withVesselSidebarHistoryLink
        />
      </StyledCard>

      {isCancellationConfirmationModalOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Quitter sans enregistrer"
          message="Vous êtes en train d’abandonner la création ou l’édition d’un signalement."
          onCancel={closeCancellationConfirmationModal}
          onConfirm={close}
          title="Abandon de signalement"
        />
      )}
    </>
  )
}

const StyledCard = styled(SideWindowCard)<{
  $isSuperUser: boolean
}>`
  left: ${p => (p.$isSuperUser ? '70px' : 0)};
  z-index: 1001;
`

const StyledLinkButton = styled(LinkButton)`
  font-size: 13px;
  margin-top: 8px;

  > .Element-IconBox {
    rotate: 90deg;
  }
`

const StyledCurrentReportingList = styled(CurrentReportingList)`
  flex-grow: 1;
  overflow-y: auto;
  margin-left: 16px;
  margin-right: 16px;
`
