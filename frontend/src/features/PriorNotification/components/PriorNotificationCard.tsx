import { ErrorWall } from '@components/ErrorWall'
import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { LogbookMessage } from '@features/Logbook/components/VesselLogbook/LogbookMessages/messages/LogbookMessage'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import {
  getPriorNotificationFishingCatchesFromLogbookMessageFishingCatches,
  getPriorNotificationTypesFromLogbookMessagePnoTypes,
  isPriorNotificationZero
} from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Accent, Button, Level } from '@mtes-mct/monitor-ui'
import { useIsSuperUser } from 'auth/hooks/useIsSuperUser'
import styled from 'styled-components'
import { LoadingSpinnerWall } from 'ui/LoadingSpinnerWall'

import { SideWindowCard } from '../../../components/SideWindowCard'
import { priorNotificationActions } from '../slice'
import { CardBanner } from './shared/CardBanner'
import { CardBodyHead } from './shared/CardBodyHead'
import { CardHeader } from './shared/CardHeader'
import { DownloadButton } from './shared/DownloadButton'

type PriorNotificationCardProps = Readonly<{
  bodyChildren?: React.ReactNode
  detail: PriorNotification.Detail | undefined
  footerChildren?: React.ReactNode
  isLoading?: boolean
  otherDisplayedErrorKey?: DisplayedErrorKey
}>
export function PriorNotificationCard({
  bodyChildren,
  detail,
  footerChildren,
  isLoading = false,
  otherDisplayedErrorKey
}: PriorNotificationCardProps) {
  const dispatch = useMainAppDispatch()
  const displayedError = useMainAppSelector(
    state => state.displayedError[DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_CARD_ERROR]
  )
  const isSuperUser = useIsSuperUser()

  const controlledDisplayedErrorKey = displayedError
    ? DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_CARD_ERROR
    : otherDisplayedErrorKey

  const close = () => {
    dispatch(priorNotificationActions.closePriorNotificationCardAndForm())
  }

  if (controlledDisplayedErrorKey) {
    return (
      <StyledCard $isSuperUser={isSuperUser} onBackgroundClick={close}>
        <ErrorWall displayedErrorKey={controlledDisplayedErrorKey} />
      </StyledCard>
    )
  }

  if (!detail || isLoading) {
    return (
      <StyledCard $isSuperUser={isSuperUser} onBackgroundClick={close}>
        <LoadingSpinnerWall />
      </StyledCard>
    )
  }

  return (
    <StyledCard $isSuperUser={isSuperUser} onBackgroundClick={close}>
      {detail?.state === PriorNotification.State.PENDING_SEND && (
        <CardBanner isCollapsible level={Level.WARNING} top="100px">
          Le préavis est en cours de diffusion.
        </CardBanner>
      )}
      {detail?.state === PriorNotification.State.PENDING_AUTO_SEND && (
        <CardBanner isCollapsible level={Level.WARNING} top="100px">
          Le préavis est en cours d’envoi aux unités qui l’ont demandé.
        </CardBanner>
      )}

      <FrontendErrorBoundary>
        <CardHeader onClose={close} selectedVesselIdentity={detail.vesselIdentity} withCloseButton withFirstTitleRow />

        <Body>
          <CardBodyHead
            applicableState={detail.state}
            detail={detail}
            hasBeenComputed
            isNewPriorNotification={false}
            isPriorNotificationZero={isPriorNotificationZero(
              getPriorNotificationFishingCatchesFromLogbookMessageFishingCatches(
                detail.logbookMessage.message.catchOnboard
              )
            )}
            isVesselUnderCharter={detail.isVesselUnderCharter}
            riskFactor={detail.riskFactor}
            tripSegments={detail.logbookMessage.tripSegments}
            types={getPriorNotificationTypesFromLogbookMessagePnoTypes(detail.logbookMessage.message.pnoTypes)}
          />

          <hr />

          <LogbookMessage
            isFirst
            isManuallyCreated={detail.isManuallyCreated ?? false}
            logbookMessage={detail.logbookMessage}
          />

          <hr />

          {bodyChildren}
        </Body>

        <Footer>
          <Button accent={Accent.TERTIARY} onClick={close}>
            Fermer
          </Button>

          <DownloadButton
            isManuallyCreated={detail.isManuallyCreated}
            pnoLogbookMessage={detail.logbookMessage}
            reportId={detail.reportId}
          />

          {footerChildren}
        </Footer>
      </FrontendErrorBoundary>
    </StyledCard>
  )
}

const StyledCard = styled(SideWindowCard)<{
  $isSuperUser: boolean
}>`
  left: ${p => (p.$isSuperUser ? '70px' : 0)};
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  padding: 32px;

  > hr {
    margin: 24px 0;
  }
`

const Footer = styled.div`
  border-top: 1px solid ${p => p.theme.color.lightGray};
  display: flex;
  justify-content: flex-end;
  padding: 16px 32px;
  height: 30px;

  > .Element-Button:not(:first-child) {
    margin-left: 8px;
  }

  > div {
    margin-left: 8px;
  }
`
