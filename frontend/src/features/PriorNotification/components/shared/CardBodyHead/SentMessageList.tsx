import { useGetPriorNotificationSentNessagesQuery } from '@features/PriorNotification/priorNotificationApi'
import { customDayjs, Icon } from '@mtes-mct/monitor-ui'
import { Steps } from 'rsuite'
import styled from 'styled-components'

import { SentMessagesBatchStatus } from './constants'
import { getSentMessagesBatches, getSubscribersFromSentMessages } from './utils'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

type SentMessageListProps = Readonly<{
  detail: PriorNotification.Detail
}>
export function SentMessageList({ detail }: SentMessageListProps) {
  const { data: sentMessages, isError } = useGetPriorNotificationSentNessagesQuery(detail.reportId)

  const sentMessagesBatches = sentMessages ? getSentMessagesBatches(sentMessages) : undefined
  const lastSentMessagesBatch = sentMessagesBatches ? sentMessagesBatches[sentMessagesBatches.length - 1] : undefined
  const subscribers = lastSentMessagesBatch ? getSubscribersFromSentMessages(lastSentMessagesBatch.messages) : undefined

  return (
    <>
      <Title>Liste de diffusion du préavis</Title>
      {isError && <p>Impossible de récupérer la liste.</p>}
      {!isError && (
        <>
          {!subscribers && <p>Chargement en cours...</p>}
          {subscribers && subscribers.length === 0 && <p>Aucun message n’a été envoyé pour ce préavis.</p>}
          {subscribers &&
            subscribers.map(subsriber => (
              <SubscriberRow>
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
          {!sentMessagesBatches && <p>Chargement en cours...</p>}
          <>
            {sentMessagesBatches && sentMessagesBatches.length === 0 && (
              <p>Aucun message n’a été envoyé pour ce préavis.</p>
            )}
          </>
          {sentMessagesBatches && (
            <History current={sentMessagesBatches.length} vertical>
              {sentMessagesBatches.map(sentMessagesBatch => (
                <HistoryItem
                  key={+sentMessagesBatch.firstMessageDate}
                  $isSuccess={sentMessagesBatch.sendStatus === SentMessagesBatchStatus.SUCCESS}
                  data-cy="SentMessageList-historyItem"
                  icon={
                    sentMessagesBatch.sendStatus === SentMessagesBatchStatus.SUCCESS ? (
                      <Icon.Confirm />
                    ) : (
                      <Icon.Reject />
                    )
                  }
                  title={
                    <StepTitle>
                      <StepDate>
                        {customDayjs(sentMessagesBatch.firstMessageDate).format('[Le] DD/MM/YYYY [à] HH[h]mm [(UTC)]')}
                      </StepDate>
                      <StepStatus>{sentMessagesBatch.statusMessage}</StepStatus>
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
  color: ${p => p.theme.color.slateGray};
  margin: 16px 0 0;
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
  padding: 12px 16px 12px 8px;

  > .rs-steps-item:not(:first-child) {
    padding-bottom: 12px;

    &:not(:first-child) {
      margin-top: 4px;
    }
  }
`

const HistoryItem = styled(Steps.Item)<{
  $isSuccess: boolean
}>`
  padding-bottom: 16px;

  > .rs-steps-item-tail {
    border-color: ${p => p.theme.color.slateGray};
    top: 26px;
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