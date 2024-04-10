import {
  DUMMY_MISSION_DONE,
  DUMMY_MISSION_IN_PROGRESS,
  DUMMY_MISSION_UPCOMING
} from '@features/Mission/__tests__/__mocks__/dummyMissions'
import { MissionAction } from '@features/Mission/missionAction.types'
import { getMissionCompletionFrontStatus } from '@features/Mission/utils'
import { describe, expect, it } from '@jest/globals'

import FrontCompletionStatus = MissionAction.FrontCompletionStatus
import CompletionStatus = MissionAction.CompletionStatus

describe('domain/entities/mission/utils.getMissionCompletionFrontStatus()', () => {
  it('should return the mission completion front status', async () => {
    const missionCompletionUpToDate = getMissionCompletionFrontStatus(DUMMY_MISSION_IN_PROGRESS, [
      CompletionStatus.COMPLETED
    ])
    expect(missionCompletionUpToDate).toBe(FrontCompletionStatus.UP_TO_DATE)

    const missionCompletionCompleted = getMissionCompletionFrontStatus(DUMMY_MISSION_DONE, [CompletionStatus.COMPLETED])
    expect(missionCompletionCompleted).toBe(FrontCompletionStatus.COMPLETED)

    const missionCompletionToComplete = getMissionCompletionFrontStatus(DUMMY_MISSION_IN_PROGRESS, [
      CompletionStatus.TO_COMPLETE
    ])
    expect(missionCompletionToComplete).toBe(FrontCompletionStatus.TO_COMPLETE)

    const missionCompletionToCompleteEnded = getMissionCompletionFrontStatus(DUMMY_MISSION_DONE, [
      CompletionStatus.TO_COMPLETE
    ])
    expect(missionCompletionToCompleteEnded).toBe(FrontCompletionStatus.TO_COMPLETE_MISSION_ENDED)

    const missionCompletionUpcoming = getMissionCompletionFrontStatus(DUMMY_MISSION_UPCOMING, [
      CompletionStatus.TO_COMPLETE
    ])
    expect(missionCompletionUpcoming).toBeUndefined()
  })
})
