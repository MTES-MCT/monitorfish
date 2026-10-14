import { Inquiry } from '@features/Inquiry/Inquiry.types'
import { describe, expect, it } from '@jest/globals'
import { customDayjs } from '@mtes-mct/monitor-ui'

import {
  getInquiryDate,
  getInquiryNumberOfInfractionsWithoutRecord,
  getInquiryNumberOfInfractionsWithRecord,
  getYearsToInquiries
} from '../controls'

const DUMMY_INQUIRY: Inquiry.Inquiry = {
  conclusion: undefined,
  endDateTimeUtc: undefined,
  id: 'b2f6a1c4-3d5e-4f7a-8b9c-0d1e2f3a4b5c',
  infractions: [],
  isSignedByInspector: undefined,
  missionId: undefined,
  observations: [],
  origin: Inquiry.InquiryOrigin.CNSP_REPORTING,
  service: undefined,
  startDateTimeUtc: undefined,
  status: Inquiry.InquiryStatus.IN_PROGRESS,
  type: undefined,
  vesselId: 1
}

describe('domain/entities/controls', () => {
  it('getInquiryDate Should return the end date of a closed inquiry', () => {
    const inquiry = {
      ...DUMMY_INQUIRY,
      endDateTimeUtc: '2025-02-01T17:00:00Z',
      startDateTimeUtc: '2024-10-21T09:00:00Z',
      status: Inquiry.InquiryStatus.CLOSED
    }

    const result = getInquiryDate(inquiry)

    expect(result).toEqual('2025-02-01T17:00:00Z')
  })

  it('getInquiryDate Should return the start date of an inquiry in progress', () => {
    const inquiry = { ...DUMMY_INQUIRY, startDateTimeUtc: '2024-10-21T09:00:00Z' }

    const result = getInquiryDate(inquiry)

    expect(result).toEqual('2024-10-21T09:00:00Z')
  })

  it('getYearsToInquiries Should group inquiries by year and keep empty years', () => {
    const currentYear = customDayjs().utc().year()
    const fromDate = `${currentYear - 2}-06-01T00:00:00Z`
    const inquiryInProgress = { ...DUMMY_INQUIRY, id: '1', startDateTimeUtc: `${currentYear}-04-13T08:00:00Z` }
    const closedInquiry = {
      ...DUMMY_INQUIRY,
      endDateTimeUtc: `${currentYear - 1}-02-01T17:00:00Z`,
      id: '2',
      startDateTimeUtc: `${currentYear - 2}-10-21T09:00:00Z`,
      status: Inquiry.InquiryStatus.CLOSED
    }

    const result = getYearsToInquiries(fromDate, [inquiryInProgress, closedInquiry])

    expect(result).toEqual({
      [currentYear - 2]: [],
      [currentYear - 1]: [closedInquiry],
      [currentYear]: [inquiryInProgress]
    })
  })

  it('getInquiryNumberOfInfractions Should count pending infractions as without record', () => {
    const inquiry = {
      ...DUMMY_INQUIRY,
      infractions: [
        {
          controlType: Inquiry.InquiryControlType.LANDING_OBLIGATION,
          infractionType: Inquiry.InquiryInfractionType.WITH_REPORT,
          natinfs: ['7064'],
          observations: undefined
        },
        {
          controlType: Inquiry.InquiryControlType.SECTOR,
          infractionType: Inquiry.InquiryInfractionType.WITHOUT_REPORT,
          natinfs: ['2610'],
          observations: undefined
        },
        {
          controlType: Inquiry.InquiryControlType.FISHING_REPORTING_OBLIGATION,
          infractionType: Inquiry.InquiryInfractionType.WAITING,
          natinfs: ['4234'],
          observations: undefined
        }
      ]
    }

    expect(getInquiryNumberOfInfractionsWithRecord(inquiry)).toEqual(1)
    expect(getInquiryNumberOfInfractionsWithoutRecord(inquiry)).toEqual(2)
  })
})
