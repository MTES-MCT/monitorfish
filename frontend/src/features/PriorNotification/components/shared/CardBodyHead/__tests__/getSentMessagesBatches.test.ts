import { describe, expect, it } from '@jest/globals'

import { SentMessagesBatchStatus } from '../constants'
import { getSentMessagesBatches } from '../utils'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

describe('features/PriorNotification/components/shared/CardBodyHead > getSentMessagesBatches()', () => {
  it('Should return empty array when input is empty', () => {
    const sentMessages = []

    const result = getSentMessagesBatches(sentMessages)

    expect(result).toHaveLength(0)
  })

  it('Shoudl return a single batch when input has one message', () => {
    const sentMessages: PriorNotification.SentMessage[] = [
      {
        communicationMeans: 'EMAIL',
        dateTimeUtc: '2023-10-01T10:00:00Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email@example.com',
        recipientName: 'John Doe',
        recipientOrganization: 'Org A',
        success: true
      }
    ]

    const result = getSentMessagesBatches(sentMessages)

    expect(result).toHaveLength(1)

    expect(result[0]!.firstMessageDate).toEqual(new Date('2023-10-01T10:00:00Z'))
    expect(result[0]!.messages).toEqual(sentMessages)
    expect(result[0]!.sendStatus).toEqual(SentMessagesBatchStatus.SUCCESS)
    expect(result[0]!.statusMessage).toEqual('Préavis diffusé avec succès à tous les contacts.')
  })

  it('Should group messages sent within 30s into one batch', () => {
    const sentMessages: PriorNotification.SentMessage[] = [
      {
        communicationMeans: 'EMAIL',
        dateTimeUtc: '2023-10-01T10:00:00Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email1@example.com',
        recipientName: 'John Doe',
        recipientOrganization: 'Org A',
        success: true
      },
      {
        communicationMeans: 'EMAIL',
        dateTimeUtc: '2023-10-01T10:00:20Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email2@example.com',
        recipientName: 'Jane Smith',
        recipientOrganization: 'Org B',
        success: true
      }
    ]

    const result = getSentMessagesBatches(sentMessages)

    expect(result).toHaveLength(1)

    expect(result[0]!.firstMessageDate).toEqual(new Date('2023-10-01T10:00:00Z'))
    expect(result[0]!.messages).toEqual(sentMessages)
    expect(result[0]!.sendStatus).toEqual(SentMessagesBatchStatus.SUCCESS)
    expect(result[0]!.statusMessage).toEqual('Préavis diffusé avec succès à tous les contacts.')
  })

  it('Should split into batches when messages are sent more than 30s apart', () => {
    const sentMessages: PriorNotification.SentMessage[] = [
      {
        communicationMeans: 'EMAIL',
        dateTimeUtc: '2023-10-01T10:00:00Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email1@example.com',
        recipientName: 'John Doe',
        recipientOrganization: 'Org A',
        success: true
      },
      {
        communicationMeans: 'EMAIL',
        dateTimeUtc: '2023-10-01T10:00:31Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email2@example.com',
        recipientName: 'Jane Smith',
        recipientOrganization: 'Org B',
        success: true
      }
    ]

    const result = getSentMessagesBatches(sentMessages)

    expect(result).toHaveLength(2)

    expect(result[0]!.firstMessageDate).toEqual(new Date('2023-10-01T10:00:31Z'))
    expect(result[0]!.messages).toEqual([sentMessages[1]])
    expect(result[0]!.sendStatus).toEqual(SentMessagesBatchStatus.SUCCESS)

    expect(result[1]!.firstMessageDate).toEqual(new Date('2023-10-01T10:00:00Z'))
    expect(result[1]!.messages).toEqual([sentMessages[0]])
    expect(result[1]!.sendStatus).toEqual(SentMessagesBatchStatus.SUCCESS)
  })

  it('Should set `sendStatus` to `PARTIAL_FAILURE` when some messages fail', () => {
    const sentMessages: PriorNotification.SentMessage[] = [
      {
        communicationMeans: 'EMAIL',
        dateTimeUtc: '2023-10-01T10:00:00Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email1@example.com',
        recipientName: 'John Doe',
        recipientOrganization: 'Org A',
        success: true
      },
      {
        communicationMeans: 'EMAIL',
        dateTimeUtc: '2023-10-01T10:00:20Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email2@example.com',
        recipientName: 'Jane Smith',
        recipientOrganization: 'Org B',
        success: false
      }
    ]

    const result = getSentMessagesBatches(sentMessages)

    expect(result).toHaveLength(1)

    expect(result[0]!.sendStatus).toEqual(SentMessagesBatchStatus.PARTIAL_FAILURE)
    expect(result[0]!.statusMessage).toEqual('Échec de la diffusion pour le(s) contact(s): email2@example.com.')
  })

  it('Should set `sendStatus` to `TOTAL_FAILURE` when all messages fail', () => {
    const sentMessages: PriorNotification.SentMessage[] = [
      {
        communicationMeans: 'EMAIL',
        dateTimeUtc: '2023-10-01T10:00:00Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email1@example.com',
        recipientName: 'John Doe',
        recipientOrganization: 'Org A',
        success: false
      },
      {
        communicationMeans: 'EMAIL',
        dateTimeUtc: '2023-10-01T10:00:20Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email2@example.com',
        recipientName: 'Jane Smith',
        recipientOrganization: 'Org B',
        success: false
      }
    ]

    const result = getSentMessagesBatches(sentMessages)

    expect(result).toHaveLength(1)

    expect(result[0]!.sendStatus).toEqual(SentMessagesBatchStatus.TOTAL_FAILURE)
    expect(result[0]!.statusMessage).toEqual(
      'Échec de la diffusion pour tous les contacts: email1@example.com, email2@example.com.'
    )
  })

  it('Should handles multiple batches with varying success statuses', () => {
    const sentMessages: PriorNotification.SentMessage[] = [
      {
        communicationMeans: 'EMAIL',
        dateTimeUtc: '2023-10-01T10:00:00Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email1@example.com',
        recipientName: 'John Doe',
        recipientOrganization: 'Org A',
        success: true
      },
      {
        communicationMeans: 'EMAIL',
        dateTimeUtc: '2023-10-01T10:00:25Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email2@example.com',
        recipientName: 'Jane Smith',
        recipientOrganization: 'Org B',
        success: false
      },
      {
        communicationMeans: 'EMAIL',
        dateTimeUtc: '2023-10-01T10:01:05Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email3@example.com',
        recipientName: 'Alice Johnson',
        recipientOrganization: 'Org C',
        success: false
      },
      {
        communicationMeans: 'EMAIL',
        dateTimeUtc: '2023-10-01T10:01:25Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email4@example.com',
        recipientName: 'Bob Brown',
        recipientOrganization: 'Org D',
        success: true
      }
    ]

    const result = getSentMessagesBatches(sentMessages)

    expect(result).toHaveLength(2)

    expect(result[0]!.firstMessageDate).toEqual(new Date('2023-10-01T10:01:05Z'))
    expect(result[0]!.messages).toEqual([sentMessages[2], sentMessages[3]])
    expect(result[0]!.sendStatus).toEqual(SentMessagesBatchStatus.PARTIAL_FAILURE)
    expect(result[0]!.statusMessage).toEqual('Échec de la diffusion pour le(s) contact(s): email3@example.com.')

    expect(result[1]!.firstMessageDate).toEqual(new Date('2023-10-01T10:00:00Z'))
    expect(result[1]!.messages).toEqual([sentMessages[0], sentMessages[1]])
    expect(result[1]!.sendStatus).toEqual(SentMessagesBatchStatus.PARTIAL_FAILURE)
    expect(result[1]!.statusMessage).toEqual('Échec de la diffusion pour le(s) contact(s): email2@example.com.')
  })
})
