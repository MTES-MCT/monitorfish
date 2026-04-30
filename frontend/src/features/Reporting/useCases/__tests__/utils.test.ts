import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { ReportingValidityOption } from '@features/Reporting/types/ReportingValidityOption'
import { describe, expect, it } from '@jest/globals'
import { customDayjs } from '@mtes-mct/monitor-ui'

import { computeExpirationDate } from '../utils'

const baseFormValues = {
  flagState: 'FR',
  isArchived: false,
  isIUU: false,
  isUnknownVessel: true,
  reportingDate: '2024-01-01T00:00:00.000Z',
  reportingSource: ReportingOriginSource.OPS,
  title: 'Test',
  type: ReportingType.OBSERVATION
}

describe('computeExpirationDate', () => {
  it('returns a date one month in the future for ONE_MONTH', () => {
    const result = computeExpirationDate({
      ...baseFormValues,
      validityOption: ReportingValidityOption.ONE_MONTH
    } as any)

    expect(result).toBeDefined()
    const resultDay = customDayjs(result)
    const expectedDay = customDayjs().utc().add(1, 'month')
    expect(Math.abs(resultDay.diff(expectedDay, 'second'))).toBeLessThan(5)
  })

  it('returns a date twelve months in the future for TWELVE_MONTHS', () => {
    const result = computeExpirationDate({
      ...baseFormValues,
      validityOption: ReportingValidityOption.TWELVE_MONTHS
    } as any)

    expect(result).toBeDefined()
    const resultDay = customDayjs(result)
    const expectedDay = customDayjs().utc().add(12, 'month')
    expect(Math.abs(resultDay.diff(expectedDay, 'second'))).toBeLessThan(5)
  })

  it('returns the form expirationDate for CUSTOM', () => {
    const expirationDate = '2999-06-01T00:00:00.000Z'
    const result = computeExpirationDate({
      ...baseFormValues,
      expirationDate,
      validityOption: ReportingValidityOption.CUSTOM
    } as any)

    expect(result).toBe(expirationDate)
  })

  it('returns undefined for UNTIL_NEXT_DEP', () => {
    const result = computeExpirationDate({
      ...baseFormValues,
      validityOption: ReportingValidityOption.UNTIL_NEXT_DEP
    } as any)

    expect(result).toBeUndefined()
  })

  it('returns undefined for INDEFINITE', () => {
    const result = computeExpirationDate({
      ...baseFormValues,
      validityOption: ReportingValidityOption.INDEFINITE
    } as any)

    expect(result).toBeUndefined()
  })

  it('returns undefined when no validityOption and no expirationDate', () => {
    const result = computeExpirationDate({ ...baseFormValues } as any)

    expect(result).toBeUndefined()
  })

  it('passes through formValues.expirationDate when validityOption is absent', () => {
    const expirationDate = '2999-12-31T00:00:00.000Z'
    const result = computeExpirationDate({ ...baseFormValues, expirationDate } as any)

    expect(result).toBe(expirationDate)
  })
})
