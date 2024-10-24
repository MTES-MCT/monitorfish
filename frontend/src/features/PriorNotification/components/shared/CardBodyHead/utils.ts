import { customDayjs, pluralize } from '@mtes-mct/monitor-ui'
import dayjs from 'dayjs'

import { SentMessagesBatchStatus } from './constants'

import type { SentMessageBatch, Subscriber } from './types'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

export function getSubscribersFromSentMessages(sentMessages: PriorNotification.SentMessage[]): Subscriber[] {
  const subscribersMap = sentMessages.reduce<Record<string, Subscriber>>((subscribersMapAccumulator, sentMessage) => {
    const subscriberKey = `${sentMessage.recipientOrganization}-${sentMessage.recipientName}`

    if (!subscribersMapAccumulator[subscriberKey]) {
      // eslint-disable-next-line no-param-reassign
      subscribersMapAccumulator[subscriberKey] = {
        name: sentMessage.recipientName,
        organization: sentMessage.recipientOrganization
      }
    }

    const subscriber = subscribersMapAccumulator[subscriberKey]
    if (sentMessage.communicationMeans === 'EMAIL') {
      subscriber.email = sentMessage.recipientAddressOrNumber
    } else if (sentMessage.communicationMeans === 'SMS' || sentMessage.communicationMeans === 'FAX') {
      subscriber.phone = sentMessage.recipientAddressOrNumber
    }

    return subscribersMapAccumulator
  }, {})

  return Object.values(subscribersMap)
}

/**
 * Get sent messages batches from a list of sent messages grouped by batch of 30s and ordered by date descending.
 */
export function getSentMessagesBatches(sentMessages: PriorNotification.SentMessage[]): SentMessageBatch[] {
  const sentMessagesSortedByDateAsc = [...sentMessages].sort((a, b) => (a.dateTimeUtc < b.dateTimeUtc ? -1 : 1))

  const sentMessageBatches: SentMessageBatch[] = []
  let currentBatch: PriorNotification.SentMessage[] = []
  let currentBatchFirstSentMessageDate: string | undefined

  sentMessagesSortedByDateAsc.forEach(sentMessage => {
    if (!currentBatchFirstSentMessageDate) {
      currentBatchFirstSentMessageDate = sentMessage.dateTimeUtc
      currentBatch.push(sentMessage)

      return
    }

    const timeDifference = dayjs(sentMessage.dateTimeUtc).diff(dayjs(currentBatchFirstSentMessageDate), 'second')

    // If this message was sent less than 30s after the first message of the current batch,
    // we consider it as part of the same batch
    if (timeDifference <= 30) {
      currentBatch.push(sentMessage)

      return
    }

    // Otherwise, we consider the current batch as complete
    sentMessageBatches.push(processBatch(currentBatch))

    // and we start a new one
    currentBatch = [sentMessage]
    currentBatchFirstSentMessageDate = sentMessage.dateTimeUtc
  })

  // Let's not forget to process the last batch since it's not followed by another batch
  if (currentBatch.length > 0) {
    sentMessageBatches.push(processBatch(currentBatch))
  }

  return sentMessageBatches.reverse()
}

function processBatch(messages: PriorNotification.SentMessage[]): SentMessageBatch {
  const fistMessageHumanizedDate = customDayjs
    .utc(messages[0]!.dateTimeUtc)
    .format('[Le] DD/MM/YYYY [à] HH[h]mm [(UTC)]')
  const [sendStatus, statusMessage] = getStatusAndStatusMessage(messages)

  return {
    fistMessageHumanizedDate,
    messages,
    sendStatus,
    statusMessage
  }
}

function getStatusAndStatusMessage(messages: PriorNotification.SentMessage[]): [SentMessagesBatchStatus, string] {
  const failedEmailsAndPhones = messages
    .filter(({ success }) => !success)
    .map(({ recipientAddressOrNumber }) => recipientAddressOrNumber)
  const failedEmailsAndPhonesAsHtml = failedEmailsAndPhones.map(emailOrPhone => `<b>${emailOrPhone}</b>`).join(', ')

  switch (true) {
    case failedEmailsAndPhones.length === messages.length:
      return [
        SentMessagesBatchStatus.TOTAL_FAILURE,
        `Échec de la diffusion pour tous les contacts: ${failedEmailsAndPhonesAsHtml}.`
      ]

    case failedEmailsAndPhones.length > 0:
      return [
        SentMessagesBatchStatus.PARTIAL_FAILURE,
        `Échec de la diffusion pour ${pluralize('le', failedEmailsAndPhones.length)} ${pluralize('contact', failedEmailsAndPhones.length)}: ${failedEmailsAndPhonesAsHtml}.`
      ]

    default:
      return [SentMessagesBatchStatus.SUCCESS, 'Préavis diffusé avec succès à tous les contacts.']
  }
}
