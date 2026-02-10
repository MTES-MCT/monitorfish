import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { ConfirmationModal } from '@components/ConfirmationModal'
import { SideWindowCard } from '@components/SideWindowCard'
import { CurrentReportingList } from '@features/Reporting/components/VesselReportings/CurrentReportingList'
import { getDefaultReportingsStartDate } from '@features/Reporting/utils'
import { useGetVesselReportingsByVesselIdentityQuery } from '@features/Vessel/vesselApi'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { trackEvent } from '@hooks/useTracking'
import { FingerprintLoader, Icon, LinkButton, THEME } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
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

  const { data: vesselReportings, isFetching } = useGetVesselReportingsByVesselIdentityQuery(
    vesselIdentity
      ? {
          fromDate: getDefaultReportingsStartDate().toISOString(),
          vesselIdentity
        }
      : skipToken,
    RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS
  )

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
      trackEvent({
        action: `Ecriture d'un signalement depuis un préavis`,
        category: 'REPORTING',
        name: 'CNSP'
      })

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

        {(!vesselReportings || isFetching) && <FingerprintLoader className="radar" color={THEME.color.charcoal} />}
        {!!vesselReportings && (
          <StyledCurrentReportingList
            onIsDirty={handleIsDirty}
            vesselIdentity={vesselIdentity}
            vesselReportings={vesselReportings}
            withOpenedNewReportingForm={isPriorNotificationCardOpened}
            withVesselSidebarHistoryLink
          />
        )}
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
