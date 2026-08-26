import { MissionAction } from '@features/Mission/missionAction.types'
import { missionActionApi } from '@features/Mission/missionActionApi'
import { autoSaveMissionAction } from '@features/Mission/useCases/autoSaveMissionAction'
import { beforeEach, describe, expect, it } from '@jest/globals'
import { omit } from 'lodash-es'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

/**
 * Warning: We could not add `jest` import as it makes the test to fail.
 * @see: https://github.com/swc-project/jest/issues/14#issuecomment-2525330413
 */

jest.mock('@features/Mission/missionActionApi', () => ({
  missionActionApi: {
    endpoints: {
      createMissionAction: { initiate: jest.fn() },
      updateMissionAction: { initiate: jest.fn() }
    }
  }
}))
jest.mock('@features/Mission/components/MissionForm/utils', () => ({
  getMissionActionDataFromFormValues: (actionFormValues, missionId) => ({
    ...omit(actionFormValues, ['draftKey', 'isValid']),
    missionId
  })
}))
jest.mock('@features/Mission/components/MissionForm/utils/isMissionActionFormValid', () => ({
  isMissionActionFormValid: () => true
}))
jest.mock('@features/SideWindow/useCases/addSideWindowBanner', () => ({ addSideWindowBanner: jest.fn() }))
jest.mock('@utils/logSoftError', () => ({ logSoftError: jest.fn() }))

const createMissionActionMock = missionActionApi.endpoints.createMissionAction.initiate as jest.Mock
const updateMissionActionMock = missionActionApi.endpoints.updateMissionAction.initiate as jest.Mock

const dispatch = jest.fn(action => action) as any
const getState = jest.fn() as any

function createDeferred<T>() {
  let reject!: (error: any) => void
  let resolve!: (value: T) => void
  const promise = new Promise<T>((internalResolve, internalReject) => {
    resolve = internalResolve
    reject = internalReject
  })

  return { promise, reject, resolve }
}

function getDraftActionFormValues(draftKey: string): MissionActionFormValues {
  return {
    actionDatetimeUtc: '2026-08-26T06:53:00Z',
    actionType: MissionAction.MissionActionType.LAND_CONTROL,
    draftKey,
    isValid: true
  }
}

describe('autoSaveMissionAction()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Should create the action only once when a second auto-save fires while the creation is still in flight', async () => {
    // Given
    const creation = createDeferred<{ id: number }>()
    createMissionActionMock.mockReturnValue({ unwrap: () => creation.promise })
    updateMissionActionMock.mockReturnValue({ unwrap: () => Promise.resolve() })
    const draftActionFormValues = getDraftActionFormValues('draft-key-in-flight')

    // When: two auto-saves overlap before the creation response has arrived
    const firstSave = autoSaveMissionAction(draftActionFormValues, 43969, true)(dispatch, getState, undefined)
    const secondSave = autoSaveMissionAction({ ...draftActionFormValues, speciesObservations: '5 BF1' }, 43969, true)(
      dispatch,
      getState,
      undefined
    )
    creation.resolve({ id: 20632 })

    // Then
    expect(await firstSave).toBe(20632)
    expect(await secondSave).toBe(20632)
    expect(createMissionActionMock).toHaveBeenCalledTimes(1)
    // The second payload must still be persisted, as an update of the created action
    expect(updateMissionActionMock).toHaveBeenCalledTimes(1)
    expect(updateMissionActionMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 20632, speciesObservations: '5 BF1' })
    )
  })

  it('Should update instead of re-creating when a stale draft without id is auto-saved after the action was created', async () => {
    // Given
    createMissionActionMock.mockReturnValue({ unwrap: () => Promise.resolve({ id: 20632 }) })
    updateMissionActionMock.mockReturnValue({ unwrap: () => Promise.resolve() })
    const draftActionFormValues = getDraftActionFormValues('draft-key-stale-closure')

    await autoSaveMissionAction(draftActionFormValues, 43969, true)(dispatch, getState, undefined)

    // When: a stale closure re-saves the same draft, still without its created id
    const staleSavedId = await autoSaveMissionAction(
      { ...draftActionFormValues, otherComments: 'stale closure payload' },
      43969,
      true
    )(dispatch, getState, undefined)

    // Then
    expect(staleSavedId).toBe(20632)
    expect(createMissionActionMock).toHaveBeenCalledTimes(1)
    expect(updateMissionActionMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 20632, otherComments: 'stale closure payload' })
    )
  })

  it('Should create two different drafts separately', async () => {
    // Given
    createMissionActionMock
      .mockReturnValueOnce({ unwrap: () => Promise.resolve({ id: 20632 }) })
      .mockReturnValueOnce({ unwrap: () => Promise.resolve({ id: 20633 }) })

    // When
    const firstId = await autoSaveMissionAction(getDraftActionFormValues('draft-key-a'), 43969, true)(
      dispatch,
      getState,
      undefined
    )
    const secondId = await autoSaveMissionAction(getDraftActionFormValues('draft-key-b'), 43969, true)(
      dispatch,
      getState,
      undefined
    )

    // Then
    expect(firstId).toBe(20632)
    expect(secondId).toBe(20633)
    expect(createMissionActionMock).toHaveBeenCalledTimes(2)
  })

  it('Should retry the creation when the previous creation failed', async () => {
    // Given
    createMissionActionMock
      .mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('Network error')) })
      .mockReturnValueOnce({ unwrap: () => Promise.resolve({ id: 20632 }) })
    const draftActionFormValues = getDraftActionFormValues('draft-key-retry')

    // When
    const failedSaveId = await autoSaveMissionAction(draftActionFormValues, 43969, true)(dispatch, getState, undefined)
    const retriedSaveId = await autoSaveMissionAction(draftActionFormValues, 43969, true)(dispatch, getState, undefined)

    // Then
    expect(failedSaveId).toBeUndefined()
    expect(retriedSaveId).toBe(20632)
    expect(createMissionActionMock).toHaveBeenCalledTimes(2)
  })
})
