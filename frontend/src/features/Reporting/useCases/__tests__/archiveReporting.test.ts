import { PendingAlertValueType } from '@features/Alert/types'
import { fortyHeightHourAlertReporting } from '@features/Reporting/useCases/__tests__/__mocks__/dummyReporting'
import { archiveReporting } from '@features/Reporting/useCases/archiveReporting'
import { describe, it, expect, afterAll } from '@jest/globals'
import { dispatchProcessor } from '@store/__tests__/utils'

import { VesselIdentifier } from '../../../../domain/entities/vessel/types'
import { deleteReporting } from '../deleteReporting'

/**
 * Warning: We could not add `jest` import as it makes the test to fail.
 * We need to have
 * @see: https://github.com/swc-project/jest/issues/14#issuecomment-2525330413
 */

// @ts-ignore
jest.mock('../../reportingApi', () => jest.fn())
// @ts-ignore
jest.mock('../deleteReporting', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esModule: true,
  // @ts-ignore
  deleteReporting: jest.fn()
}))

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
    // @ts-ignore
    jest.resetModules()
  })

  it('Should delete reporting When alert is MISSING_FAR_48_HOURS_ALERT', async () => {
    // When
    dispatchProcessor(archiveReporting(fortyHeightHourAlertReporting), INITIAL_STATE)

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
    dispatchProcessor(archiveReporting(otherAlertReporting), INITIAL_STATE)

    // Then
    expect(deleteReporting).toHaveBeenCalledTimes(0)
  })
})
