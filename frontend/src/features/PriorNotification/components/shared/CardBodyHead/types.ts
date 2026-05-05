import type { SentMessagesBatchStatus } from './constants'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

export type Subscriber = {
  emails: string[]
  name: string
  organization: string
  phones: string[]
}

export type SentMessageBatch = {
  fistMessageHumanizedDate: string
  messages: PriorNotification.SentMessage[]
  sendStatus: SentMessagesBatchStatus
  statusMessage: string
}
