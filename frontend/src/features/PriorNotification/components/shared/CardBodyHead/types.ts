import type { SentMessagesBatchStatus } from './constants'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

export type Subscriber = {
  email?: string
  name: string
  organization: string
  phone?: string
}

export type SentMessageBatch = {
  firstMessageDate: Date
  messages: PriorNotification.SentMessage[]
  sendStatus: SentMessagesBatchStatus
  statusMessage: string
}
