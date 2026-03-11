import { WindowContext } from '@api/constants'
import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { addReporting } from '@features/Reporting/useCases/addReporting'
import { autoSaveReporting } from '@features/Reporting/useCases/autoSaveReporting'
import { buildReportingCreation } from '@features/Reporting/useCases/utils'
import { describe, expect, it, beforeEach } from '@jest/globals'

import { reportingApi } from '../../reportingApi'
import { updateReporting } from '../updateReporting'

import type { FormEditedReporting, Reporting } from '@features/Reporting/types'
import type { Vessel } from '@features/Vessel/Vessel.types'

/**
 * Warning: We could not add `jest` import as it makes the test to fail.
 * We need to have
 * @see: https://github.com/swc-project/jest/issues/14#issuecomment-2525330413
 */

// @ts-ignore
jest.mock('../../reportingApi', () => ({
  reportingApi: {
    endpoints: {
      createReporting: { initiate: jest.fn() }
    }
  }
}))
// @ts-ignore
jest.mock('../updateReporting', () => ({ updateReporting: jest.fn() }))
// @ts-ignore
jest.mock('../addReporting', () => ({ addReporting: jest.fn() }))

const aValidFormReporting: FormEditedReporting = {
  authorContact: undefined,
  cfr: undefined,
  controlUnitId: undefined,
  description: undefined,
  expirationDate: undefined,
  externalMarker: undefined,
  flagState: '',
  gearCode: undefined,
  imo: undefined,
  ircs: undefined,
  isFishing: undefined,
  isUnknownVessel: true,
  latitude: undefined,
  length: undefined,
  longitude: undefined,
  mmsi: undefined,
  reportingSource: ReportingOriginSource.OPS,
  title: 'My reporting',
  type: ReportingType.OBSERVATION,
  vesselId: undefined,
  vesselIdentifier: undefined,
  vesselName: undefined
}

const anInvalidFormReporting: FormEditedReporting = {
  ...aValidFormReporting,
  title: ''
}

const aSavedReporting = {
  externalReferenceNumber: undefined,
  flagState: 'FR',
  id: 42,
  internalReferenceNumber: undefined,
  type: ReportingType.OBSERVATION,
  vesselId: 100,
  vesselIdentifier: undefined,
  vesselName: 'AUTO SAVED'
} as unknown as Reporting.Reporting

const vesselIdentity: Vessel.VesselIdentity = {
  beaconNumber: undefined,
  districtCode: undefined,
  externalReferenceNumber: undefined,
  flagState: 'FR',
  internalReferenceNumber: undefined,
  ircs: undefined,
  mmsi: undefined,
  vesselId: 100,
  vesselIdentifier: undefined,
  vesselLength: undefined,
  vesselName: 'TEST VESSEL'
}

describe('autoSaveReporting()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Should not save anything when form is invalid', async () => {
    const dispatch = jest.fn()

    const result = await autoSaveReporting(
      anInvalidFormReporting,
      undefined,
      undefined,
      vesselIdentity,
      WindowContext.MainWindow
    )(dispatch, jest.fn())

    expect(reportingApi.endpoints.createReporting.initiate).not.toHaveBeenCalled()
    expect(updateReporting).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
  })

  it('Should create reporting on first auto-save', async () => {
    const dispatch = jest.fn(action => action)

    await autoSaveReporting(
      aValidFormReporting,
      undefined,
      undefined,
      vesselIdentity,
      WindowContext.MainWindow
    )(dispatch, jest.fn())

    expect(addReporting).toHaveBeenCalledWith(
      expect.objectContaining({
        ...buildReportingCreation(aValidFormReporting, vesselIdentity),
        creationDate: expect.any(String)
      })
    )
    expect(updateReporting).not.toHaveBeenCalled()
  })

  it('Should update existing draft on subsequent auto-save', async () => {
    const dispatch = jest.fn(action => action)

    await autoSaveReporting(
      aValidFormReporting,
      aSavedReporting,
      undefined,
      vesselIdentity,
      WindowContext.MainWindow
    )(dispatch, jest.fn())

    expect(updateReporting).toHaveBeenCalledWith(
      expect.objectContaining({ vesselId: aSavedReporting.vesselId, vesselName: aSavedReporting.vesselName }),
      42,
      aValidFormReporting,
      aSavedReporting.type,
      WindowContext.MainWindow
    )
    expect(reportingApi.endpoints.createReporting.initiate).not.toHaveBeenCalled()
  })

  it('Should update existing reporting when editedReportingId is provided', async () => {
    const dispatch = jest.fn(action => action)

    await autoSaveReporting(
      aValidFormReporting,
      undefined,
      99,
      vesselIdentity,
      WindowContext.MainWindow
    )(dispatch, jest.fn())

    expect(updateReporting).toHaveBeenCalledWith(
      vesselIdentity,
      99,
      aValidFormReporting,
      aValidFormReporting.type,
      WindowContext.MainWindow
    )
    expect(reportingApi.endpoints.createReporting.initiate).not.toHaveBeenCalled()
  })
})
