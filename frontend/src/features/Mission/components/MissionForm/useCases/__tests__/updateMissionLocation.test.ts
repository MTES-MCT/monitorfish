import { dummyAction } from '@features/Mission/components/MissionForm/useCases/__tests__/__mocks__/dummyAction'
import { updateMissionLocation } from '@features/Mission/components/MissionForm/useCases/updateMissionLocation'
import { EnvMissionAction } from '@features/Mission/envMissionAction.types'
import { expect, jest } from '@jest/globals'
import { customDayjs } from '@mtes-mct/monitor-ui'

const mockDispatch = jest.fn()

describe('features/Mission/components/MissionForm/useCases.updateMissionLocation()', () => {
  it('Should update the mission location When there is no other actions', () => {
    // When
    updateMissionLocation(mockDispatch, [], [], [])(true, dummyAction)

    // Then
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('Should update the mission location When there is a older action', () => {
    // Given
    const olderAction = { ...dummyAction, actionDatetimeUtc: '2018-12-08T08:27:00Z' }

    // When
    updateMissionLocation(mockDispatch, [], [], [olderAction])(true, dummyAction)

    // Then
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('Should not update the mission location When there is a newer action', () => {
    // Given
    const newerAction = { ...dummyAction, actionDatetimeUtc: customDayjs().toISOString() }

    // When
    updateMissionLocation(mockDispatch, [], [], [newerAction])(true, dummyAction)

    // Then
    expect(mockDispatch).toHaveBeenCalledTimes(0)
  })

  it('Should not update the mission location When there is a newer Env action', () => {
    // Given
    const newerEnvAction = {
      actionStartDateTimeUtc: customDayjs().toISOString(),
      actionType: EnvMissionAction.MissionActionType.CONTROL,
      id: 123,
      observations: undefined
    }

    // When
    updateMissionLocation(mockDispatch, [], [newerEnvAction], [])(true, dummyAction)

    // Then
    expect(mockDispatch).toHaveBeenCalledTimes(0)
  })
})
