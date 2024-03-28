import { LogbookMessage } from '@features/Logbook/components/VesselLogbook/LogbookMessages/messages/LogbookMessage'
import { Accent, Button } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { Header } from './Header'
import { useGetPriorNotificationQuery } from '../../api'

type PriorNotificationCardProps = Readonly<{
  logbookMessageReportId: string
  onClose: () => void
}>
export function PriorNotificationCard({ logbookMessageReportId, onClose }: PriorNotificationCardProps) {
  const { data: priorNotificationDetail, error, isLoading } = useGetPriorNotificationQuery(logbookMessageReportId)

  if (isLoading) {
    return <Wrapper>Chargement en cours...</Wrapper>
  }

  if (!!error || !priorNotificationDetail) {
    return <Wrapper>Une erreur est survenue pendant le chargement du préavis.</Wrapper>
  }

  return (
    <Wrapper>
      <Background onClick={onClose} />

      <Card>
        <Header onClose={onClose} priorNotificationDetail={priorNotificationDetail} />

        <Body>
          <LogbookMessage isFirst logbookMessage={priorNotificationDetail.logbookMessage} />
        </Body>

        <Footer>
          <Button accent={Accent.TERTIARY} onClick={onClose}>
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
