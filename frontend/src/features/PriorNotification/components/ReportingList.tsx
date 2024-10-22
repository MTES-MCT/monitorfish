import { ConfirmationModal } from '@components/ConfirmationModal'
import { SideWindowCard } from '@components/SideWindowCard'
import { CurrentReportingList } from '@features/Reporting/components/CurrentReportingList'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, LinkButton } from '@mtes-mct/monitor-ui'
import { useIsSuperUser } from 'auth/hooks/useIsSuperUser'
import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { priorNotificationActions } from '../slice'
import { CardHeader } from './shared/CardHeader'

export function ReportingList() {
  const dispatch = useMainAppDispatch()
  const openedPriorNotificationDetail = useMainAppSelector(
    store => store.priorNotification.openedPriorNotificationDetail
  )
  const isReportingFormDirty = useMainAppSelector(store => store.priorNotification.isReportingFormDirty)
  const isSuperUser = useIsSuperUser()

  const [isCancellationConfirmationModalOpen, setIsCancellationConfirmationModalOpen] = useState(false)

  const vesselId = openedPriorNotificationDetail?.vesselId
  const vesselIdentity = openedPriorNotificationDetail?.vesselIdentity

  const close = () => {
    dispatch(priorNotificationActions.setIsReportingListOpened(false))
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
        <CardHeader detail={openedPriorNotificationDetail} onClose={handleClose} vesselId={vesselId}>
          <StyledLinkButton Icon={Icon.Chevron} onClick={handleClose}>
            Retourner au préavis
          </StyledLinkButton>
        </CardHeader>

        <StyledCurrentReportingList
          onIsDirty={handleIsDirty}
          vesselIdentity={vesselIdentity}
          withOpenedNewReportingForm
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
`
