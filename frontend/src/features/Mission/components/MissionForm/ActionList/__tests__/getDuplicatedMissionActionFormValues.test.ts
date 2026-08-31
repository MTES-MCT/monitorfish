import {
  getDuplicatedMissionActionFormValues,
  getMissionActionFormInitialValues
} from '@features/Mission/components/MissionForm/ActionList/utils'
import { MissionAction } from '@features/Mission/missionAction.types'
import { describe, expect, it } from '@jest/globals'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

describe('getMissionActionFormInitialValues()', () => {
  it('Should give each new action its own draft key', () => {
    // When
    const firstAction = getMissionActionFormInitialValues(MissionAction.MissionActionType.LAND_CONTROL)
    const secondAction = getMissionActionFormInitialValues(MissionAction.MissionActionType.LAND_CONTROL)

    // Then
    expect(firstAction.draftKey).toEqual(expect.any(String))
    expect(secondAction.draftKey).toEqual(expect.any(String))
    expect(firstAction.draftKey).not.toBe(secondAction.draftKey)
  })
})

describe('getDuplicatedMissionActionFormValues()', () => {
  const originalAction: MissionActionFormValues = {
    actionDatetimeUtc: '2026-08-26T06:53:00Z',
    actionType: MissionAction.MissionActionType.LAND_CONTROL,
    draftKey: 'original-draft-key',
    id: 20632,
    isValid: true,
    speciesObservations: '5 BF1',
    vesselName: 'AGATHE TYCHE'
  }

  it('Should drop the id of the original action', () => {
    // When
    const duplicatedAction = getDuplicatedMissionActionFormValues(originalAction)

    // Then
    expect(duplicatedAction.id).toBeUndefined()
  })

  it('Should give the copy its own draft key, so the auto-save creates it instead of updating the original', () => {
    // When
    const duplicatedAction = getDuplicatedMissionActionFormValues(originalAction)

    // Then
    expect(duplicatedAction.draftKey).toEqual(expect.any(String))
    expect(duplicatedAction.draftKey).not.toBe(originalAction.draftKey)
  })

  it('Should keep the other values of the original action', () => {
    // When
    const duplicatedAction = getDuplicatedMissionActionFormValues(originalAction)

    // Then
    expect(duplicatedAction.actionType).toBe(MissionAction.MissionActionType.LAND_CONTROL)
    expect(duplicatedAction.speciesObservations).toBe('5 BF1')
    expect(duplicatedAction.vesselName).toBe('AGATHE TYCHE')
  })
})
