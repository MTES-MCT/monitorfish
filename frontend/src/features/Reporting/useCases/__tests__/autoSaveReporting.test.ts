import { WindowContext } from '@api/constants'
import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { autoSaveReporting } from '@features/Reporting/useCases/autoSaveReporting'
import { buildReportingCreation } from '@features/Reporting/useCases/utils'
import { describe, expect, it, beforeEach } from '@jest/globals'

import { addVesselReporting } from '../../../Vessel/slice'
import { renderVesselFeatures } from '../../../Vessel/useCases/rendering/renderVesselFeatures'
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
      createReporting: { initiate: jest.fn() },
      updateReporting: { initiate: jest.fn() }
    }
  }
}))
// @ts-ignore
jest.mock('../updateReporting', () => ({ updateReporting: jest.fn() }))
// @ts-ignore
jest.mock('../../../Vessel/useCases/rendering/renderVesselFeatures', () => ({ renderVesselFeatures: jest.fn() }))
// @ts-ignore
jest.mock('../../../Vessel/slice', () => ({ addVesselReporting: jest.fn() }))

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
    const createRequest = {}
    const createdReporting = {
      ...aSavedReporting,
      id: 43,
      vesselName: 'CREATED REPORTING'
    } as Reporting.Reporting

    ;(reportingApi.endpoints.createReporting.initiate as jest.Mock).mockReturnValue(createRequest)

    const dispatch = jest.fn(action => {
      if (action === createRequest) {
        return { unwrap: jest.fn().mockResolvedValue(createdReporting) }
      }

      return action
    })

    const result = await autoSaveReporting(
      aValidFormReporting,
      undefined,
      undefined,
      vesselIdentity,
      WindowContext.MainWindow
    )(dispatch, jest.fn())

    expect(reportingApi.endpoints.createReporting.initiate).toHaveBeenCalledWith(
      expect.objectContaining({
        ...buildReportingCreation(aValidFormReporting, vesselIdentity),
        creationDate: expect.any(String)
      })
    )
    expect(addVesselReporting).toHaveBeenCalled()
    expect(renderVesselFeatures).toHaveBeenCalled()
    expect(result).toEqual(createdReporting)
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
    const updateRequest = {}
    ;(reportingApi.endpoints.updateReporting.initiate as jest.Mock).mockReturnValue(updateRequest)

    const dispatch = jest.fn(action => {
      if (action === updateRequest) {
        return { unwrap: jest.fn().mockResolvedValue(undefined) }
      }

      return action
    })

    await autoSaveReporting(
      aValidFormReporting,
      undefined,
      99,
      vesselIdentity,
      WindowContext.MainWindow
    )(dispatch, jest.fn())

    expect(reportingApi.endpoints.updateReporting.initiate).toHaveBeenCalledWith({
      id: 99,
      nextReportingFormData: aValidFormReporting
    })
    expect(reportingApi.endpoints.createReporting.initiate).not.toHaveBeenCalled()
  })
})
