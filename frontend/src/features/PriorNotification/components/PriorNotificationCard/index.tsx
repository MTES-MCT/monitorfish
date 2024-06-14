import { ErrorWall } from '@components/ErrorWall'
import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { LogbookMessage } from '@features/Logbook/components/VesselLogbook/LogbookMessages/messages/LogbookMessage'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Accent, Button } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'
import { LoadingSpinnerWall } from 'ui/LoadingSpinnerWall'

import { Header } from './Header'
import { priorNotificationActions } from '../../slice'

export function PriorNotificationCard() {
  const dispatch = useMainAppDispatch()
  const priorNotificationDetail = useMainAppSelector(state => state.priorNotification.priorNotificationCardDetail)
  const sideWindowPriorNotificationCardError = useMainAppSelector(
    state => state.displayedError.sideWindowPriorNotificationCardError
  )

  const close = () => {
    dispatch(priorNotificationActions.closePriorNotificationCard())
  }

  if (sideWindowPriorNotificationCardError) {
    return (
      <Wrapper>
        <Background onClick={close} />

        <Card>
          <ErrorWall displayedErrorKey={DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_CARD_ERROR} />
        </Card>
      </Wrapper>
    )
  }

  if (!priorNotificationDetail) {
    return (
      <Wrapper>
        <Background onClick={close} />

        <Card>
          <LoadingSpinnerWall />
        </Card>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Background onClick={close} />

      <Card>
        <FrontendErrorBoundary>
          <Header onClose={close} priorNotificationDetail={priorNotificationDetail} />

          <Body>
            <LogbookMessage
              isFirst
              isLessThanTwelveMetersVessel={priorNotificationDetail.isLessThanTwelveMetersVessel}
              logbookMessage={priorNotificationDetail.logbookMessage}
            />
          </Body>

          <Footer>
            <Button accent={Accent.TERTIARY} onClick={close}>
              Fermer
            </Button>
          </Footer>
        </FrontendErrorBoundary>
      </Card>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  left: 0;
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
`

const Footer = styled.div`
  border-top: 1px solid ${p => p.theme.color.lightGray};
  display: flex;
  justify-content: flex-end;
  padding: 16px 32px;
`
