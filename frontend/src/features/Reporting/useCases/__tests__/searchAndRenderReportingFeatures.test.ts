import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { REPORTINGS_VECTOR_SOURCE } from '@features/Reporting/layers/ReportingLayer/constants'
import { reportingApi } from '@features/Reporting/reportingApi'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { describe, it, expect, afterAll, beforeEach } from '@jest/globals'
import { Level } from '@mtes-mct/monitor-ui'

import { ReportingSearchPeriod } from '../../types'
import { searchAndRenderReportingFeatures } from '../searchAndRenderReportingFeatures'

import type { ApiSearchFilter, DisplayedReporting } from '../../types'

/**
 * Warning: We could not add `jest` import as it makes the test to fail.
 * We need to have
 * @see: https://github.com/swc-project/jest/issues/14#issuecomment-2525330413
 */

// @ts-ignore
jest.mock('../../reportingApi', () => ({
  reportingApi: {
    endpoints: {
      displayReportings: {
        // @ts-ignore
        initiate: jest.fn()
      }
    }
  }
}))

// @ts-ignore
jest.mock('../../layers/ReportingLayer/constants', () => ({
  REPORTINGS_VECTOR_SOURCE: {
    // @ts-ignore
    addFeatures: jest.fn(),
    // @ts-ignore
    clear: jest.fn()
  }
}))

// @ts-ignore
jest.mock('@features/MainWindow/useCases/addMainWindowBanner', () => ({
  // @ts-ignore
  addMainWindowBanner: jest.fn()
}))

const dummyReporting: DisplayedReporting = {
  coordinates: [-3.8, 46.9],
  creationDate: '2024-01-15T10:00:00Z',
  expirationDate: undefined,
  featureId: 'REPORTING:7',
  flagState: 'FR',
  id: 7,
  isArchived: false,
  isInfractionSuspicion: true,
  isIUU: false,
  isObservation: false,
  threat: 'Pêche',
  threatCharacterization: 'Chalutage',
  title: 'Suspicion de chalutage dans les 3 milles',
  type: ReportingType.INFRACTION_SUSPICION,
  validationDate: '2024-01-15T11:00:00Z',
  vesselName: 'COURANT MAIN PROFESSEUR'
}

const baseFilter: ApiSearchFilter = {
  endDate: undefined,
  isArchived: undefined,
  isIUU: undefined,
  reportingPeriod: ReportingSearchPeriod.LAST_3_MONTHS,
  reportingType: undefined,
  startDate: undefined
}

describe('searchAndRenderReportingFeatures()', () => {
  beforeEach(() => {
    // @ts-ignore
    jest.clearAllMocks()
  })

  afterAll(() => {
    // @ts-ignore
    jest.resetModules()
  })

  it('Should return early when CUSTOM period has no dates', async () => {
    // Given
    const filter: ApiSearchFilter = {
      ...baseFilter,
      endDate: undefined,
      reportingPeriod: ReportingSearchPeriod.CUSTOM,
      startDate: undefined
    }
    // @ts-ignore
    const mockDispatch = jest.fn()

    // When
    // @ts-ignore
    await searchAndRenderReportingFeatures(filter)(mockDispatch, jest.fn(), undefined)

    // Then
    expect(reportingApi.endpoints.displayReportings.initiate).not.toHaveBeenCalled()
  })

  it('Should call API, build features, and fill vector source on success', async () => {
    // Given
    // @ts-ignore
    const mockInitiateResult = { unwrap: jest.fn().mockResolvedValue([dummyReporting]) }
    // @ts-ignore
    ;(reportingApi.endpoints.displayReportings.initiate as jest.Mock).mockReturnValue(mockInitiateResult)

    // @ts-ignore
    const mockDispatch = jest.fn().mockReturnValue(mockInitiateResult)

    // When
    // @ts-ignore
    await searchAndRenderReportingFeatures(baseFilter)(mockDispatch, jest.fn(), undefined)

    // Then
    expect(reportingApi.endpoints.displayReportings.initiate).toHaveBeenCalledWith(baseFilter)
    expect(REPORTINGS_VECTOR_SOURCE.clear).toHaveBeenCalledWith(true)
    expect(REPORTINGS_VECTOR_SOURCE.addFeatures).toHaveBeenCalledWith(expect.arrayContaining([expect.any(Object)]))
  })

  it('Should dispatch addMainWindowBanner with error level on API error', async () => {
    // Given
    const mockError = new Error('Network error')
    // @ts-ignore
    const mockInitiateResult = { unwrap: jest.fn().mockRejectedValue(mockError) }
    // @ts-ignore
    ;(reportingApi.endpoints.displayReportings.initiate as jest.Mock).mockReturnValue(mockInitiateResult)

    // @ts-ignore
    const mockDispatch = jest.fn().mockReturnValue(mockInitiateResult)

    // When
    // @ts-ignore
    await searchAndRenderReportingFeatures(baseFilter)(mockDispatch, jest.fn(), undefined)

    // Then
    expect(addMainWindowBanner).toHaveBeenCalledWith(
      expect.objectContaining({
        level: Level.ERROR
      })
    )
  })
})
