import { monitorenvMissionApi } from '@features/Mission/monitorenvMissionApi'
import { saveMission } from '@features/Mission/useCases/saveMission'
import { beforeEach, describe, expect, it } from '@jest/globals'

import type { MissionMainFormValues } from '@features/Mission/components/MissionForm/types'

/**
 * Warning: We could not add `jest` import as it makes the test to fail.
 * @see: https://github.com/swc-project/jest/issues/14#issuecomment-2525330413
 */

jest.mock('@features/Mission/monitorenvMissionApi', () => ({
  monitorenvMissionApi: {
    endpoints: {
      createMission: { initiate: jest.fn() },
      updateMission: { initiate: jest.fn() }
    }
  }
}))
jest.mock('@features/Mission/components/MissionForm/utils', () => ({
  getMissionDataFromMissionFormValues: mainFormValues => mainFormValues,
  // Mirrors the real implementation's shape, so that an id wrongly taken from the (possibly stale)
  // form values instead of the given one is caught here too
  getUpdatedMissionFromMissionMainFormValues: (missionId, mainFormValues) => ({
    ...mainFormValues,
    id: missionId ?? mainFormValues.id
  })
}))
jest.mock('@features/Mission/components/MissionForm/utils/validateMissionForms', () => ({
  validateMissionForms: () => [true]
}))
jest.mock('@features/SideWindow/useCases/addSideWindowBanner', () => ({ addSideWindowBanner: jest.fn() }))
jest.mock('@utils/logSoftError', () => ({ logSoftError: jest.fn() }))

const createMissionMock = monitorenvMissionApi.endpoints.createMission.initiate as jest.Mock
const updateMissionMock = monitorenvMissionApi.endpoints.updateMission.initiate as jest.Mock

const dispatch = jest.fn(action => action) as any
const getState = jest.fn(() => ({ missionForm: { draft: undefined } })) as any

function createDeferred<T>() {
  let reject!: (error: any) => void
  let resolve!: (value: T) => void
  const promise = new Promise<T>((internalResolve, internalReject) => {
    resolve = internalResolve
    reject = internalReject
  })

  return { promise, reject, resolve }
}

const newMissionMainFormValues: MissionMainFormValues = {
  controlUnits: [],
  id: undefined,
  isGeometryComputedFromControls: false,
  isValid: true,
  startDateTimeUtc: '2026-08-26T06:00:00Z'
}

describe('saveMission()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('Should create the mission only once when a second auto-save fires while the creation is still in flight', async () => {
    // Given
    const creation = createDeferred<{ createdAtUtc: string; id: number; updatedAtUtc: string }>()
    createMissionMock.mockReturnValue({ unwrap: () => creation.promise })
    updateMissionMock.mockReturnValue({
      unwrap: () => Promise.resolve({ updatedAtUtc: '2026-08-26T06:57:12Z' })
    })

    // When: two debounced auto-saves overlap before the creation response has arrived
    const firstSave = saveMission(newMissionMainFormValues, undefined)(dispatch, getState, undefined)
    const secondSave = saveMission({ ...newMissionMainFormValues, openBy: 'CAR' }, undefined)(
      dispatch,
      getState,
      undefined
    )
    creation.resolve({ createdAtUtc: '2026-08-26T06:57:11Z', id: 43969, updatedAtUtc: '2026-08-26T06:57:11Z' })

    // Then
    const [firstSavedMission, secondSavedMission] = await Promise.all([firstSave, secondSave])
    expect(createMissionMock).toHaveBeenCalledTimes(1)
    // The second payload must still be persisted, as an update of the created mission
    expect(updateMissionMock).toHaveBeenCalledTimes(1)
    // The id must be the created one, not the (still undefined) one held by the in-flight form values
    expect(updateMissionMock).toHaveBeenCalledWith(expect.objectContaining({ id: 43969, openBy: 'CAR' }))
    expect(firstSavedMission.id).toBe(43969)
    expect(secondSavedMission.id).toBe(43969)
  })

  it('Should store the last saved `updatedAtUtc` so own SSE echoes can be detected as stale', async () => {
    // Given
    updateMissionMock.mockReturnValue({
      unwrap: () => Promise.resolve({ updatedAtUtc: '2026-08-26T07:41:50Z' })
    })

    // When
    await saveMission({ ...newMissionMainFormValues, id: 43969 }, 43969)(dispatch, getState, undefined)

    // Then
    const dispatchedActions = dispatch.mock.calls.map(call => call[0])
    expect(
      dispatchedActions.some(
        action => action?.type === 'mission/setLastSavedUpdatedAtUtc' && action?.payload === '2026-08-26T07:41:50Z'
      )
    ).toBe(true)
  })
})
