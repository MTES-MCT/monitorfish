import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { describe, expect, it } from '@jest/globals'

import { CreateOrEditReportingSchema } from '../schemas'

const baseValidData = {
  reportingSource: ReportingOriginSource.OPS,
  title: 'Test',
  type: ReportingType.OBSERVATION,
  vesselName: 'MY VESSEL'
}

describe('CreateOrEditReportingSchema vessel identifier validation', () => {
  it('passes when vesselName is provided', () => {
    const result = CreateOrEditReportingSchema.safeParse(baseValidData)
    expect(result.success).toBe(true)
  })

  it('passes when mmsi is provided', () => {
    const result = CreateOrEditReportingSchema.safeParse({ ...baseValidData, mmsi: '123456789', vesselName: undefined })
    expect(result.success).toBe(true)
  })

  it('passes when imo is provided', () => {
    const result = CreateOrEditReportingSchema.safeParse({ ...baseValidData, imo: '1234567', vesselName: undefined })
    expect(result.success).toBe(true)
  })

  it('passes when ircs is provided', () => {
    const result = CreateOrEditReportingSchema.safeParse({ ...baseValidData, ircs: 'FABC1', vesselName: undefined })
    expect(result.success).toBe(true)
  })

  it('passes when externalMarker is provided', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseValidData,
      externalMarker: 'AZ123456',
      vesselName: undefined
    })
    expect(result.success).toBe(true)
  })

  it('passes when isUnknownVessel is true and no vessel fields are filled', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      isUnknownVessel: true,
      reportingSource: ReportingOriginSource.OPS,
      title: 'Test',
      type: ReportingType.OBSERVATION
    })
    expect(result.success).toBe(true)
  })

  it('fails when no vessel identifier and isUnknownVessel is absent', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      reportingSource: ReportingOriginSource.OPS,
      title: 'Test',
      type: ReportingType.OBSERVATION
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path)
      expect(paths).toContainEqual(['isUnknownVessel'])
      expect(result.error.issues.some(i => i.message.includes('Veuillez renseigner au moins un identifiant'))).toBe(
        true
      )
    }
  })

  it('fails when no vessel identifier and isUnknownVessel is explicitly false', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      isUnknownVessel: false,
      reportingSource: ReportingOriginSource.OPS,
      title: 'Test',
      type: ReportingType.OBSERVATION
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path)
      expect(paths).toContainEqual(['isUnknownVessel'])
      expect(result.error.issues.some(i => i.message.includes('Veuillez renseigner au moins un identifiant'))).toBe(
        true
      )
    }
  })
})
