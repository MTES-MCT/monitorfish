import { PendingAlertValueType } from '@features/Alert/constants'
import { fortyHeightHourAlertReporting } from '@features/Reporting/useCases/__tests__/__mocks__/dummyReporting'
import { archiveReporting } from '@features/Reporting/useCases/archiveReporting'
import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { describe, it, expect, afterAll } from '@jest/globals'
import { mockedDispatch } from '@store/__tests__/utils'

import { deleteReporting } from '../deleteReporting'

jest.mock('../../reportingApi', () => ({
  reportingApi: {
    endpoints: {
      archiveReporting: {
        initiate: jest.fn()
      }
    }
  }
}))
jest.mock('../deleteReporting', () => ({ deleteReporting: jest.fn() }))
jest.mock('../../../Vessel/useCases/rendering/renderVesselFeatures', () => ({ renderVesselFeatures: jest.fn() }))

describe('archiveReporting()', () => {
  const INITIAL_STATE = {
    vessel: {
      selectedVesselIdentity: {
        externalReferenceNumber: '',
        flagState: '',
        internalReferenceNumber: '',
        vesselId: 1234568,
        vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
        vesselName: ''
      }
    }
  }

  afterAll(() => {
    // Reset module registry to clear the mock
    jest.resetModules()
  })

  it('Should delete reporting When alert is MISSING_FAR_48_HOURS_ALERT', async () => {
    // When
    mockedDispatch(archiveReporting(fortyHeightHourAlertReporting), INITIAL_STATE)

    // Then
    expect(deleteReporting).toHaveBeenCalled()
  })

  it('Should not delete reporting When the alert is not an MISSING_FAR_48_HOURS_ALERT', async () => {
    // Given
    const otherAlertReporting = {
      ...fortyHeightHourAlertReporting,
      value: {
        ...fortyHeightHourAlertReporting.value,
        type: PendingAlertValueType.MISSING_FAR_ALERT
      }
    }

    // When
    mockedDispatch(archiveReporting(otherAlertReporting), INITIAL_STATE)

    // Then
    expect(deleteReporting).toHaveBeenCalledTimes(0)
  })
})
