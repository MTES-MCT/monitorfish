import { fortyHeightHourAlertReporting } from '@features/Reporting/useCases/__tests__/__mocks__/dummyReporting'
import { editReportingFromMap } from '@features/Reporting/useCases/editReportingFromMap'
import { UNKNOWN_VESSEL } from '@features/Vessel/types/vessel'
import { displayVesselSidebarAndPositions } from '@features/Vessel/useCases/displayVesselSidebarAndPositions'
import { showReporting } from '@features/Vessel/useCases/showReporting'
import { showVessel } from '@features/Vessel/useCases/showVessel'
import { vesselApi } from '@features/Vessel/vesselApi'
import { describe, expect, it } from '@jest/globals'
import { mockedDispatch } from '@store/__tests__/utils'

jest.mock('../../vesselApi', () => ({
  vesselApi: {
    endpoints: {
      getVesselAndPositions: {
        initiate: jest.fn()
      }
    }
  }
}))
jest.mock('../displayVesselSidebarAndPositions', () => ({
  displayVesselSidebarAndPositions: jest.fn()
}))
jest.mock('../../../Reporting/useCases/editReportingFromMap', () => ({ editReportingFromMap: jest.fn() }))
jest.mock('../unselectVessel', () => ({ unselectVessel: jest.fn() }))

describe('showVessel()', () => {
  it('Should not open the vessel sidebar When the vessel is unknown', () => {
    // When
    mockedDispatch(showVessel(UNKNOWN_VESSEL, false), { vessel: {} })

    // Then
    expect(displayVesselSidebarAndPositions).not.toHaveBeenCalled()
  })
})

describe('showReporting()', () => {
  it('Should open the reporting form instead of the vessel sidebar When the vessel is unknown', () => {
    // Given
    const unknownVesselReporting = {
      ...fortyHeightHourAlertReporting,
      cfr: UNKNOWN_VESSEL.internalReferenceNumber,
      externalMarker: UNKNOWN_VESSEL.externalReferenceNumber,
      ircs: UNKNOWN_VESSEL.ircs,
      vesselId: UNKNOWN_VESSEL.vesselId
    }

    // When
    mockedDispatch(showReporting(unknownVesselReporting), { map: {}, vessel: {} })

    // Then
    expect(vesselApi.endpoints.getVesselAndPositions.initiate).not.toHaveBeenCalled()
    expect(editReportingFromMap).toHaveBeenCalledWith(unknownVesselReporting.id)
  })
})
