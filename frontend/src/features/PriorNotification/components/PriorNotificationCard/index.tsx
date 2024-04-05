import { LogbookMessage } from '@features/Logbook/components/VesselLogbook/LogbookMessages/messages/LogbookMessage'
import { priorNotificationActions } from '@features/PriorNotification/slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { Header } from './Header'
import { useGetPriorNotificationQuery } from '../../api'

type PriorNotificationCardProps = Readonly<{
  priorNotificationId: string
}>
export function PriorNotificationCard({ priorNotificationId }: PriorNotificationCardProps) {
  const dispatch = useMainAppDispatch()
  const { data: priorNotificationDetail, error, isLoading } = useGetPriorNotificationQuery(priorNotificationId)

  const close = () => {
    dispatch(priorNotificationActions.closePriorNotificationDetail())
  }

  if (isLoading) {
    return (
      <Wrapper>
        <Background onClick={close} />
        <Card>
          <Body>Chargement en cours...</Body>
        </Card>
      </Wrapper>
    )
  }

  if (!!error || !priorNotificationDetail) {
    return (
      <Wrapper>
        <Background onClick={close} />
        <Card>
          <Body>Une erreur est survenue pendant le chargement du préavis.</Body>
        </Card>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Background onClick={close} />

      <Card>
        <Header onClose={close} priorNotificationDetail={priorNotificationDetail} />

        <Body>
          <LogbookMessage isFirst logbookMessage={priorNotificationDetail.logbookMessage} />
        </Body>

        <Footer>
          <Button accent={Accent.TERTIARY} onClick={close}>
            Fermer
          </Button>
        </Footer>
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
  width: 600px;
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 32px;
`

const Footer = styled.div`
  border-top: 1px solid ${p => p.theme.color.lightGray};
  display: flex;
  justify-content: flex-end;
  padding: 16px 32px;
`
