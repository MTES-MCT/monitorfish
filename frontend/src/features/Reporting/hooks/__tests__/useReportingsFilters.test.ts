import { getArchivedValue, getCustomPeriodValue, getIUUValue } from '@features/Reporting/hooks/useReportingsFilters'
import { ReportingSearchPeriod } from '@features/Reporting/types'
import { expect } from '@jest/globals'

import type { ReportingsFilter } from '@features/Reporting/types'

const FILTERS: ReportingsFilter = {
  endDate: undefined,
  ids: undefined,
  isArchived: undefined,
  isIUU: undefined,
  origin: undefined,
  reportingPeriod: ReportingSearchPeriod.LAST_3_MONTHS,
  reportingType: undefined,
  startDate: undefined,
  zone: undefined
}

describe('features/Reporting/hooks/useReportingsFilters', () => {
  it('getArchivedValue Should map the tri-state status filter to its select value', () => {
    expect(getArchivedValue(undefined)).toBeUndefined()
    expect(getArchivedValue(true)).toEqual('ARCHIVED')
    expect(getArchivedValue(false)).toEqual('NOT_ARCHIVED')
  })

  it('getIUUValue Should map the tri-state IUU filter to its select value', () => {
    expect(getIUUValue(undefined)).toBeUndefined()
    expect(getIUUValue(true)).toEqual('IUU')
    expect(getIUUValue(false)).toEqual('NOT_IUU')
  })

  it('getCustomPeriodValue Should only return a range when both bounds are set', () => {
    expect(getCustomPeriodValue(FILTERS)).toBeUndefined()
    expect(getCustomPeriodValue({ ...FILTERS, startDate: '2024-01-01T00:00:00Z' })).toBeUndefined()
    expect(
      getCustomPeriodValue({ ...FILTERS, endDate: '2024-03-31T23:59:59Z', startDate: '2024-01-01T00:00:00Z' })
    ).toEqual(['2024-01-01T00:00:00Z', '2024-03-31T23:59:59Z'])
  })
})
