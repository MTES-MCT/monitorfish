import { RTK_DEFAULT_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { useGetPriorNotificationSentNessagesQuery } from '@features/PriorNotification/priorNotificationApi'
import { Icon } from '@mtes-mct/monitor-ui'
import { Steps } from 'rsuite'
import styled from 'styled-components'

import { SentMessagesBatchStatus } from './constants'
import { getSentMessagesBatches, getSubscribersFromSentMessages } from './utils'

type SentMessageListProps = Readonly<{
  detail: PriorNotification.Detail
  state: PriorNotification.State | undefined
}>
export function SentMessageList({ detail, state }: SentMessageListProps) {
  const {
    data: sentMessages,
    isError,
    isFetching
  } = useGetPriorNotificationSentNessagesQuery(detail.reportId, RTK_DEFAULT_REFETCH_QUERY_OPTIONS)

  const sentMessagesBatches = sentMessages ? getSentMessagesBatches(sentMessages) : []
  const lastSentMessagesBatch = sentMessagesBatches ? sentMessagesBatches[sentMessagesBatches.length - 1] : undefined
  const subscribers = lastSentMessagesBatch ? getSubscribersFromSentMessages(lastSentMessagesBatch.messages) : []

  return (
    <>
      <Title>Liste de diffusion du préavis</Title>
      {isError && <p>Impossible de récupérer la liste.</p>}
      {!isError && (
        <>
          {isFetching && <p>Chargement en cours...</p>}
          {!isFetching && subscribers.length === 0 && (
            <InfoMessage>
              {state === PriorNotification.State.FAILED_SEND
                ? `Aucune unité n'est inscrite à ce préavis.`
                : `Aucun message n’a été envoyé pour ce préavis.`}
            </InfoMessage>
          )}
          {!isFetching &&
            subscribers.map(subsriber => (
              <SubscriberRow key={`${subsriber.organization}-${subsriber.name}`}>
                <p>
                  <b>{subsriber.name}</b> ({subsriber.organization})
                </p>
                <SubscriberRowBody>
                  {subsriber.email && <span>{subsriber.email}</span>}
                  {subsriber.phone && <span>{subsriber.phone}</span>}
                </SubscriberRowBody>
              </SubscriberRow>
            ))}
        </>
      )}

      <Title>Historique de diffusion du préavis</Title>
      {isError && <p>Impossible de récupérer l’historique.</p>}
      {!isError && (
        <>
          {isFetching && <p>Chargement en cours...</p>}
          {!isFetching && sentMessagesBatches.length === 0 && (
            <InfoMessage>Aucun message n’a été envoyé pour ce préavis.</InfoMessage>
          )}
          {!isFetching && sentMessagesBatches.length > 0 && (
            <History current={sentMessagesBatches.length} vertical>
              {sentMessagesBatches.map(sentMessagesBatch => (
                <HistoryItem
                  key={sentMessagesBatch.fistMessageHumanizedDate}
                  $isSuccess={sentMessagesBatch.sendStatus === SentMessagesBatchStatus.SUCCESS}
                  data-cy="SentMessageList-historyItem"
                  icon={
                    sentMessagesBatch.sendStatus === SentMessagesBatchStatus.SUCCESS ? (
                      <Icon.Confirm size={16} />
                    ) : (
                      <Icon.Reject size={16} />
                    )
                  }
                  title={
                    <StepTitle>
                      <StepDate>{sentMessagesBatch.fistMessageHumanizedDate}</StepDate>
                      <StepStatus dangerouslySetInnerHTML={{ __html: sentMessagesBatch.statusMessage }} />
                    </StepTitle>
                  }
                />
              ))}
            </History>
          )}
        </>
      )}
    </>
  )
}

const Title = styled.p`
  color: #ff3392;
  margin: 16px 0 0;
`

const InfoMessage = styled.p`
  color: #ff3392;
  font-style: italic;
`

const SubscriberRow = styled.address`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-direction: column;
  font-style: normal;
  margin-top: 4px;
  padding: 16px 12px;
`
const SubscriberRowBody = styled.p`
  display: flex;
  flex-direction: column;
  margin-top: 2px;
`

const History = styled(Steps)`
  background-color: ${p => p.theme.color.gainsboro};
  margin-top: 4px;
  min-height: unset;
  padding: 12px 16px 0 8px;

  > .rs-steps-item:not(:first-child) {
    padding-bottom: 12px;

    &:not(:first-child) {
      margin-top: 0px;
    }
  }
`

const HistoryItem = styled(Steps.Item)<{
  $isSuccess: boolean
}>`
  padding-bottom: 16px;
  padding-left: 24px;

  > .rs-steps-item-icon-wrapper {
    border-radius: 0;
    width: 16px;
  }

  > .rs-steps-item-tail {
    border-color: #ff3392;
    border-width: 2px;
    left: 7px;
    top: 24px;
  }

  .rs-steps-item-custom-icon {
    color: ${p => (p.$isSuccess ? p.theme.color.mediumSeaGreen : p.theme.color.maximumRed)};
  }
`

const StepTitle = styled.div`
  color: ${p => p.theme.color.gunMetal};
  line-height: 18px;
`
const StepDate = styled.p`
  font-weight: 500;
`
const StepStatus = styled.p`
  margin-top: 0;
`
