import { fortyHeightHourAlertReporting } from '@features/Reporting/useCases/__tests__/__mocks__/dummyReporting'
import { archiveReporting } from '@features/Reporting/useCases/archiveReporting'
import * as deleteReporting from '@features/Reporting/useCases/deleteReporting'
import { describe, it, expect, jest, afterAll } from '@jest/globals'
import { dispatchProcessor } from '@store/__tests__/utils'

import { PendingAlertValueType } from '../../../../domain/entities/alerts/types'
import { VesselIdentifier } from '../../../../domain/entities/vessel/types'

jest.mock('../../reportingApi', () => jest.fn())

jest.mock('../deleteReporting', () => ({
  __esModule: true,
  deleteReporting: () => jest.fn()
}))

jest.spyOn(deleteReporting, 'deleteReporting')

const INITIAL_STATE = {
  vessel: {
    selectedVesselIdentity: {
      externalReferenceNumber: '',
      flagState: 'ES',
      internalReferenceNumber: 'FR04504564',
      vesselId: 1234568,
      vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
      vesselName: 'A VESSEL'
    }
  }
}

describe('archiveReporting()', () => {
  afterAll(() => {
    // Reset module registry to clear the mock
    jest.resetModules()
  })

  it('Should delete reporting When alert is MISSING_FAR_48_HOURS_ALERT', async () => {
    // When
    dispatchProcessor(archiveReporting(fortyHeightHourAlertReporting), INITIAL_STATE)

    // Then
    expect(deleteReporting.deleteReporting).toHaveBeenCalled()
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
    dispatchProcessor(archiveReporting(otherAlertReporting), INITIAL_STATE)

    // Then
    expect(deleteReporting.deleteReporting).toHaveBeenCalledTimes(0)
  })
})
