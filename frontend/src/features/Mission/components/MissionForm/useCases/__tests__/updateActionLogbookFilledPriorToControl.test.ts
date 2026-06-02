import { dummyAction } from '@features/Mission/components/MissionForm/useCases/__tests__/__mocks__/dummyAction'
import { updateActionLogbookFilledPriorToControl } from '@features/Mission/components/MissionForm/useCases/updateActionLogbookFilledPriorToControl'
import { MissionAction } from '@features/Mission/missionAction.types'
import { UNKNOWN_VESSEL } from '@features/Vessel/types/vessel'
import { beforeEach, describe, expect, it } from '@jest/globals'

// `E_ISR_ENABLED` is derived from `import.meta.env` and resolves to `false` under Jest (CI has no
// `.env`), which would otherwise make the use-case return early. We force it on so the branches
// under test run.
//
// IMPORTANT: do NOT import `jest` from `@jest/globals` in this file. swc only hoists `jest.mock`
// above the imports when it references the *global* `jest`; with an imported binding the mock runs
// after the use-case module (and the real `constants`) is loaded, so it would have no effect.
jest.mock('@features/Mission/components/MissionForm/constants', () => ({ E_ISR_ENABLED: true }))

const mockDispatch = jest.fn()
const mockSetFieldValue = jest.fn()

describe('features/Mission/components/MissionForm/useCases.updateActionLogbookFilledPriorToControl()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Should do nothing When there is no internalReferenceNumber', async () => {
    // When
    await updateActionLogbookFilledPriorToControl(
      mockDispatch,
      mockSetFieldValue
    )({
      ...dummyAction,
      internalReferenceNumber: undefined
    } as any)

    // Then
    expect(mockDispatch).not.toHaveBeenCalled()
    expect(mockSetFieldValue).not.toHaveBeenCalled()
  })

  it('Should set NOT_APPLICABLE When the vessel is 10 meters or under', async () => {
    // Given
    mockDispatch
      .mockResolvedValueOnce({ data: { length: 8 } } as never) // getVessel
      .mockResolvedValueOnce({ data: true } as never) // getHasFilledLogbookForCurrentTrip

    // When
    await updateActionLogbookFilledPriorToControl(
      mockDispatch,
      mockSetFieldValue
    )({
      ...dummyAction,
      vesselId: 1
    } as any)

    // Then
    expect(mockSetFieldValue).toHaveBeenCalledWith(
      'logbookFilledPriorToControl',
      MissionAction.ControlCheck.NOT_APPLICABLE
    )
  })

  it('Should set the logbook-filled value When the vessel is over 10 meters', async () => {
    // Given
    mockDispatch
      .mockResolvedValueOnce({ data: { length: 15 } } as never)
      .mockResolvedValueOnce({ data: false } as never)

    // When
    await updateActionLogbookFilledPriorToControl(
      mockDispatch,
      mockSetFieldValue
    )({
      ...dummyAction,
      vesselId: 1
    } as any)

    // Then
    expect(mockSetFieldValue).toHaveBeenCalledWith('logbookFilledPriorToControl', MissionAction.ControlCheck.NO)
  })

  it('Should set the logbook-filled value without fetching the vessel When the vessel is unknown', async () => {
    // Given: no vessel is fetched, so `dispatch` is only called once (for the logbook query)
    mockDispatch.mockResolvedValueOnce({ data: true } as never)

    // When
    await updateActionLogbookFilledPriorToControl(
      mockDispatch,
      mockSetFieldValue
    )({
      ...dummyAction,
      vesselId: UNKNOWN_VESSEL.vesselId
    } as any)

    // Then
    expect(mockDispatch).toHaveBeenCalledTimes(1)
    expect(mockSetFieldValue).toHaveBeenCalledWith('logbookFilledPriorToControl', MissionAction.ControlCheck.YES)
  })
})
