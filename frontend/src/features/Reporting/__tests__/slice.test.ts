import { reportingActions, reportingReducer } from '@features/Reporting/slice'
import { ReportingSearchPeriod } from '@features/Reporting/types'
import { ReportingOrigin } from '@features/Reporting/types/ReportingOrigin'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { expect } from '@jest/globals'

/**
 * The map menu and the reporting list read and write these same filters, so a change made on one
 * side is what the other side renders and queries with. These tests pin that single source down.
 */
describe('features/Reporting/slice', () => {
  const initialState = reportingReducer(undefined, { type: '@@INIT' })

  it('Should default to the last 3 months, with no other filter set', () => {
    expect(initialState.filters).toEqual({
      endDate: undefined,
      ids: undefined,
      isArchived: undefined,
      isIUU: undefined,
      origin: undefined,
      reportingPeriod: ReportingSearchPeriod.LAST_3_MONTHS,
      reportingType: undefined,
      startDate: undefined,
      zone: undefined
    })
  })

  it('Should replace the whole filter object on setFilters', () => {
    const nextFilters = {
      ...initialState.filters,
      isArchived: true,
      origin: ReportingOrigin.ALERT,
      reportingType: ReportingType.OBSERVATION,
      zone: 'POLYGON ((0 0, 0 10, 10 10, 10 0, 0 0))'
    }

    const state = reportingReducer(initialState, reportingActions.setFilters(nextFilters))

    expect(state.filters).toEqual(nextFilters)
  })

  it('Should keep the other filters untouched when one of them changes', () => {
    const withZone = reportingReducer(
      initialState,
      reportingActions.setFilters({ ...initialState.filters, zone: 'POLYGON ((0 0, 0 1, 1 1, 1 0, 0 0))' })
    )

    const withZoneAndOrigin = reportingReducer(
      withZone,
      reportingActions.setFilters({ ...withZone.filters, origin: ReportingOrigin.SATELLITE })
    )

    expect(withZoneAndOrigin.filters.zone).toEqual('POLYGON ((0 0, 0 1, 1 1, 1 0, 0 0))')
    expect(withZoneAndOrigin.filters.origin).toEqual(ReportingOrigin.SATELLITE)
    expect(withZoneAndOrigin.filters.reportingPeriod).toEqual(ReportingSearchPeriod.LAST_3_MONTHS)
  })
})
