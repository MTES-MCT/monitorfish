import { Mission } from '@features/Mission/mission.types'
import { MissionAction } from '@features/Mission/missionAction.types'
import { getMissionCompletionFrontStatus } from '@features/Mission/utils'

import FrontCompletionStatus = MissionAction.FrontCompletionStatus

export function completionStatusFilterFunction(
  mission: Mission.MissionWithActions,
  selectedFrontCompletionStatus: FrontCompletionStatus[] | undefined
): boolean {
  if (!selectedFrontCompletionStatus || selectedFrontCompletionStatus.length === 0) {
    return true
  }

  const actionsCompletion = mission.actions.map(action => action.completion)
  const frontCompletionStatus = getMissionCompletionFrontStatus(mission, actionsCompletion)
  if (!frontCompletionStatus) {
    return false
  }

  // we don't make difference between TO_COMPLETE and TO_COMPLETE_MISSION_ENDED in filters
  if (frontCompletionStatus === FrontCompletionStatus.TO_COMPLETE_MISSION_ENDED) {
    return selectedFrontCompletionStatus.includes(FrontCompletionStatus.TO_COMPLETE)
  }

  return selectedFrontCompletionStatus.includes(frontCompletionStatus)
}
