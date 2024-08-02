import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { LogbookMessage } from '@features/Logbook/components/VesselLogbook/LogbookMessages/messages/LogbookMessage'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import {
  getPriorNotificationFishingCatchesFromLogbookMessageFishingCatches,
  getPriorNotificationTypesFromLogbookMessagePnoTypes,
  isZeroNotice
} from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button } from '@mtes-mct/monitor-ui'
import { useIsSuperUser } from 'auth/hooks/useIsSuperUser'
import styled from 'styled-components'
import { LoadingSpinnerWall } from 'ui/LoadingSpinnerWall'

import { Header } from './Header'
import { priorNotificationActions } from '../../slice'
import { DownloadButton } from '../shared/DownloadButton'
import { TagBar } from '../shared/TagBar'

type PriorNotificationCardLayoutProps = Readonly<{
  applicableState?: PriorNotification.State
  bodyChildren?: React.ReactNode
  footerChildren?: React.ReactNode
  isLoading?: boolean
  priorNotificationDetail?: PriorNotification.PriorNotificationDetail
}>
export function PriorNotificationCard({
  applicableState,
  bodyChildren,
  footerChildren,
  isLoading = false,
  priorNotificationDetail
}: PriorNotificationCardLayoutProps) {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()

  const isInvalidated = priorNotificationDetail?.logbookMessage?.message?.isInvalidated
  const isPendingVerification = priorNotificationDetail?.state === PriorNotification.State.PENDING_VERIFICATION
  const hasDesignatedPorts = priorNotificationDetail?.logbookMessage?.message?.pnoTypes?.find(
    type => type.hasDesignatedPorts
  )

  const close = () => {
    dispatch(priorNotificationActions.closePriorNotificationCard())
    dispatch(priorNotificationActions.closePriorNotificationForm())
  }

  if (!priorNotificationDetail || isLoading) {
    return (
      <Wrapper $isSuperUser={isSuperUser}>
        <Background onClick={close} />

        <Card>
          <LoadingSpinnerWall />
        </Card>
      </Wrapper>
    )
  }

  return (
    <Wrapper $isSuperUser={isSuperUser}>
      <Background onClick={close} />

      <Card>
        <FrontendErrorBoundary>
          <Header onClose={close} priorNotificationDetail={priorNotificationDetail} />

          <Body>
            <TagBar
              isInvalidated={isInvalidated}
              isVesselUnderCharter={priorNotificationDetail.isVesselUnderCharter}
              isZeroNotice={isZeroNotice(
                getPriorNotificationFishingCatchesFromLogbookMessageFishingCatches(
                  priorNotificationDetail.logbookMessage.message.catchOnboard
                )
              )}
              riskFactor={priorNotificationDetail.riskFactor}
              state={applicableState}
              tripSegments={priorNotificationDetail.logbookMessage.tripSegments}
              types={getPriorNotificationTypesFromLogbookMessagePnoTypes(
                priorNotificationDetail.logbookMessage.message.pnoTypes
              )}
            />

            {isPendingVerification && <Intro>Le préavis doit être vérifié par le CNSP avant sa diffusion.</Intro>}
            <Intro hasNoTopMargin={isPendingVerification}>
              Le navire doit respecter un délai d’envoi{hasDesignatedPorts && ' et débarquer dans un port désigné'}.
            </Intro>

            <hr />

            <LogbookMessage
              isFirst
              isManuallyCreated={priorNotificationDetail.isManuallyCreated ?? false}
              logbookMessage={priorNotificationDetail.logbookMessage}
            />

            <hr />

            {bodyChildren}
          </Body>

          <Footer>
            <Button accent={Accent.TERTIARY} onClick={close}>
              Fermer
            </Button>

            <DownloadButton
              pnoLogbookMessage={priorNotificationDetail.logbookMessage}
              reportId={priorNotificationDetail.reportId}
            />

            {footerChildren}
          </Footer>
        </FrontendErrorBoundary>
      </Card>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  // TODO Pass this prop via a context?
  $isSuperUser: boolean
}>`
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  left: ${p => (p.$isSuperUser ? '70px' : 0)};
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
`

const Background = styled.div`
  background-color: ${p => p.theme.color.charcoal};
  opacity: 0.5;
  flex-grow: 1;
`

const Card = styled.div`
  background-color: ${p => p.theme.color.white};
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 560px;
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

const Intro = styled.p<{
  hasNoTopMargin?: boolean
}>`
  ${p => p.hasNoTopMargin && 'margin-top: 2px;'}
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
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
