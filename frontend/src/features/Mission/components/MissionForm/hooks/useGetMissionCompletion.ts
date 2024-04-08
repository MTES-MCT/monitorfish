import { getMissionCompletionFrontStatus } from '@features/Mission/components/MissionForm/utils'
import { MissionAction } from '@features/Mission/missionAction.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'

import FrontCompletionStatus = MissionAction.FrontCompletionStatus

export function useGetMissionCompletion(): FrontCompletionStatus {
  const draft = useMainAppSelector(state => state.missionForm.draft)
  const actionsCompletion = draft?.actionsFormValues?.map(action => action.completion)

  return getMissionCompletionFrontStatus(draft?.mainFormValues, actionsCompletion)
}
