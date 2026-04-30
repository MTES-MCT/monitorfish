import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { ReportingValidityOption } from '@features/Reporting/types/ReportingValidityOption'
import { describe, expect, it } from '@jest/globals'

import { CreateOrEditReportingSchema } from '../schemas'

const baseValidData = {
  reportingDate: '2024-01-01T00:00:00.000Z',
  reportingSource: ReportingOriginSource.OPS,
  title: 'Test',
  type: ReportingType.OBSERVATION,
  validityOption: ReportingValidityOption.INDEFINITE,
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
      reportingDate: '2024-01-01T00:00:00.000Z',
      reportingSource: ReportingOriginSource.OPS,
      title: 'Test',
      type: ReportingType.OBSERVATION,
      validityOption: ReportingValidityOption.INDEFINITE
    })
    expect(result.success).toBe(true)
  })

  it('fails when no vessel identifier and isUnknownVessel is absent', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      reportingDate: '2024-01-01T00:00:00.000Z',
      reportingSource: ReportingOriginSource.OPS,
      title: 'Test',
      type: ReportingType.OBSERVATION
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path)
      expect(paths).toContainEqual(['isUnknownVessel'])
      expect(
        result.error.issues.some(i => i.message.includes('Veuillez renseigner au moins un identifiant (nom, MMSI, IMO'))
      ).toBe(true)
    }
  })

  it('fails when no vessel identifier and isUnknownVessel is explicitly false', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      isUnknownVessel: false,
      reportingDate: '2024-01-01T00:00:00.000Z',
      reportingSource: ReportingOriginSource.OPS,
      title: 'Test',
      type: ReportingType.OBSERVATION
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path)
      expect(paths).toContainEqual(['isUnknownVessel'])
      expect(
        result.error.issues.some(i => i.message.includes('Veuillez renseigner au moins un identifiant (nom, MMSI, IMO'))
      ).toBe(true)
    }
  })
})

describe('CreateOrEditReportingSchema reportingSource conditional fields validation', () => {
  it('passes when reportingSource is SATELLITE and satelliteType is provided', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseValidData,
      reportingSource: ReportingOriginSource.SATELLITE,
      satelliteType: 'SPIRE'
    })
    expect(result.success).toBe(true)
  })

  it('fails when reportingSource is SATELLITE and satelliteType is missing', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseValidData,
      reportingSource: ReportingOriginSource.SATELLITE
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path)
      expect(paths).toContainEqual(['satelliteType'])
    }
  })

  it('passes when reportingSource is OTHER and otherSourceType is provided and authorContact is provided', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseValidData,
      authorContact: 'John Doe',
      otherSourceType: 'NGO',
      reportingSource: ReportingOriginSource.OTHER
    })
    expect(result.success).toBe(true)
  })

  it('fails when reportingSource is OTHER and otherSourceType is missing', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseValidData,
      authorContact: 'John Doe',
      reportingSource: ReportingOriginSource.OTHER
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path)
      expect(paths).toContainEqual(['otherSourceType'])
    }
  })

  it('fails when reportingSource is OTHER and authorContact is missing', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseValidData,
      otherSourceType: 'NGO',
      reportingSource: ReportingOriginSource.OTHER
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path)
      expect(paths).toContainEqual(['authorContact'])
    }
  })

  it('passes when reportingSource is UNIT and controlUnitId and authorContact are provided', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseValidData,
      authorContact: 'John Doe',
      controlUnitId: 42,
      reportingSource: ReportingOriginSource.UNIT
    })
    expect(result.success).toBe(true)
  })

  it('fails when reportingSource is UNIT and authorContact is missing', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseValidData,
      controlUnitId: 42,
      reportingSource: ReportingOriginSource.UNIT
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path)
      expect(paths).toContainEqual(['authorContact'])
    }
  })
})

describe('CreateOrEditReportingSchema validityOption validation', () => {
  it('passes when validityOption is INDEFINITE', () => {
    const result = CreateOrEditReportingSchema.safeParse(baseValidData)
    expect(result.success).toBe(true)
  })

  it('passes when a future expirationDate is provided without validityOption', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseValidData,
      expirationDate: '2999-01-01T00:00:00.000Z',
      validityOption: undefined
    })
    expect(result.success).toBe(true)
  })

  it('passes when validityOption is UNTIL_NEXT_DEP without expirationDate', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseValidData,
      validityOption: ReportingValidityOption.UNTIL_NEXT_DEP
    })
    expect(result.success).toBe(true)
  })

  it('passes when validityOption is ONE_MONTH without expirationDate', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseValidData,
      validityOption: ReportingValidityOption.ONE_MONTH
    })
    expect(result.success).toBe(true)
  })

  it('fails when neither expirationDate nor validityOption is provided', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseValidData,
      validityOption: undefined
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path)
      expect(paths).toContainEqual(['validityOption'])
      expect(result.error.issues.some(i => i.message === 'Veuillez choisir une fin de validité.')).toBe(true)
    }
  })

  it('passes when isArchived is true even without validityOption or expirationDate', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseValidData,
      isArchived: true,
      validityOption: undefined
    })
    expect(result.success).toBe(true)
  })

  it('fails when expirationDate is in the past', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseValidData,
      expirationDate: '2000-01-01T00:00:00.000Z',
      validityOption: ReportingValidityOption.CUSTOM
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path)
      expect(paths).toContainEqual(['expirationDate'])
      expect(result.error.issues.some(i => i.message === 'La date de fin de validité doit être dans le futur.')).toBe(
        true
      )
    }
  })

  it('passes when isArchived is true and expirationDate is in the past', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseValidData,
      expirationDate: '2000-01-01T00:00:00.000Z',
      isArchived: true,
      validityOption: ReportingValidityOption.CUSTOM
    })
    expect(result.success).toBe(true)
  })
})

describe('CreateOrEditReportingSchema isIUU coordinates validation', () => {
  const baseIUUData = {
    isIUU: true,
    reportingDate: '2024-01-01T00:00:00.000Z',
    reportingSource: ReportingOriginSource.OPS,
    title: 'Test IUU',
    type: ReportingType.OBSERVATION,
    validityOption: ReportingValidityOption.INDEFINITE,
    vesselName: 'MY VESSEL'
  }

  it('passes when isIUU is false and no coordinates provided', () => {
    const result = CreateOrEditReportingSchema.safeParse({ ...baseValidData, isIUU: false })
    expect(result.success).toBe(true)
  })

  it('passes when isIUU is true and both latitude and longitude are provided', () => {
    const result = CreateOrEditReportingSchema.safeParse({
      ...baseIUUData,
      latitude: 48.5,
      longitude: -4.2,
      numberOfVessels: 1
    })
    expect(result.success).toBe(true)
  })

  it('fails when isIUU is true and latitude is missing', () => {
    const result = CreateOrEditReportingSchema.safeParse({ ...baseIUUData, longitude: -4.2, numberOfVessels: 1 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path)
      expect(paths).toContainEqual(['latitude'])
    }
  })

  it('fails when isIUU is true and numberOfVessels is missing', () => {
    const result = CreateOrEditReportingSchema.safeParse({ ...baseIUUData, latitude: 48.5, longitude: -4.2 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path)
      expect(paths).toContainEqual(['numberOfVessels'])
    }
  })

  it('fails when isIUU is true and longitude is missing', () => {
    const result = CreateOrEditReportingSchema.safeParse({ ...baseIUUData, latitude: 48.5, numberOfVessels: 1 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path)
      expect(paths).toContainEqual(['longitude'])
    }
  })
})
