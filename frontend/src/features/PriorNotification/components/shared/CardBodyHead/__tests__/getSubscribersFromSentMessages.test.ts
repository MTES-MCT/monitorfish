import { describe, expect, it } from '@jest/globals'

import { getSubscribersFromSentMessages } from '../utils'

import type { Subscriber } from '../types'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

describe('features/PriorNotification/components/shared/CardBodyHead > getSubscribersFromSentMessages()', () => {
  it('Should return an empty array when input is empty', () => {
    const sentMessages: PriorNotification.SentMessage[] = []

    const result = getSubscribersFromSentMessages(sentMessages)

    expect(result).toEqual([])
  })

  it('Should return a single subscriber when input has one message', () => {
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

    const result = getSubscribersFromSentMessages(sentMessages)

    expect(result).toEqual([
      {
        email: 'email@example.com',
        name: 'John Doe',
        organization: 'Org A'
      }
    ] satisfies Subscriber[])
  })

  it('Should combine messages to the same subscriber with same organization & name', () => {
    const sentMessages: PriorNotification.SentMessage[] = [
      {
        communicationMeans: 'EMAIL',
        dateTimeUtc: '2023-10-01T10:00:00Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email@example.com',
        recipientName: 'John Doe',
        recipientOrganization: 'Org A',
        success: true
      },
      {
        communicationMeans: 'SMS',
        dateTimeUtc: '2023-10-01T10:01:00Z',
        errorMessage: undefined,
        recipientAddressOrNumber: '1234567890',
        recipientName: 'John Doe',
        recipientOrganization: 'Org A',
        success: true
      }
    ]

    const result = getSubscribersFromSentMessages(sentMessages)

    expect(result).toEqual([
      {
        email: 'email@example.com',
        name: 'John Doe',
        organization: 'Org A',
        phone: '1234567890'
      }
    ] satisfies Subscriber[])
  })

  it('Should handle multiple subscribers with different organizations and names', () => {
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
        communicationMeans: 'SMS',
        dateTimeUtc: '2023-10-01T10:01:00Z',
        errorMessage: undefined,
        recipientAddressOrNumber: '1234567890',
        recipientName: 'Jane Smith',
        recipientOrganization: 'Org B',
        success: true
      },
      {
        communicationMeans: 'FAX',
        dateTimeUtc: '2023-10-01T10:02:00Z',
        errorMessage: undefined,
        recipientAddressOrNumber: '0987654321',
        recipientName: 'Alice Johnson',
        recipientOrganization: 'Org C',
        success: true
      }
    ]

    const result = getSubscribersFromSentMessages(sentMessages)

    expect(result).toEqual([
      {
        email: 'email1@example.com',
        name: 'John Doe',
        organization: 'Org A'
      },
      {
        name: 'Jane Smith',
        organization: 'Org B',
        phone: '1234567890'
      },
      {
        name: 'Alice Johnson',
        organization: 'Org C',
        phone: '0987654321'
      }
    ] satisfies Subscriber[])
  })

  it('Should deduplicate subscribers by organization and name', () => {
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
        dateTimeUtc: '2023-10-01T10:01:00Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email2@example.com',
        recipientName: 'John Doe',
        recipientOrganization: 'Org A',
        success: true
      }
    ]

    const result = getSubscribersFromSentMessages(sentMessages)

    expect(result).toEqual([
      {
        email: 'email2@example.com',
        name: 'John Doe',
        organization: 'Org A'
      }
    ] satisfies Subscriber[])
  })

  it('Should set both email and phone when the same subscriber has messages with different communication means', () => {
    const sentMessages: PriorNotification.SentMessage[] = [
      {
        communicationMeans: 'EMAIL',
        dateTimeUtc: '2023-10-01T10:00:00Z',
        errorMessage: undefined,
        recipientAddressOrNumber: 'email@example.com',
        recipientName: 'John Doe',
        recipientOrganization: 'Org A',
        success: true
      },
      {
        communicationMeans: 'SMS',
        dateTimeUtc: '2023-10-01T10:01:00Z',
        errorMessage: undefined,
        recipientAddressOrNumber: '1234567890',
        recipientName: 'John Doe',
        recipientOrganization: 'Org A',
        success: true
      },
      {
        communicationMeans: 'FAX',
        dateTimeUtc: '2023-10-01T10:02:00Z',
        errorMessage: undefined,
        recipientAddressOrNumber: '0987654321',
        recipientName: 'John Doe',
        recipientOrganization: 'Org A',
        success: true
      }
    ]

    const result = getSubscribersFromSentMessages(sentMessages)

    expect(result).toEqual([
      {
        email: 'email@example.com',
        name: 'John Doe',
        organization: 'Org A',
        phone: '0987654321'
      }
    ] satisfies Subscriber[])
  })
})
