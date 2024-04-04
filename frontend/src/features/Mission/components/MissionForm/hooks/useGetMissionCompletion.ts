import { getMissionCompletion, getMissionCompletionFrontStatus } from '@features/Mission/components/MissionForm/utils'
import { MissionAction } from '@features/Mission/missionAction.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'

import { getMissionStatus } from '../../../../../domain/entities/mission/utils'

import FrontCompletionStatus = MissionAction.FrontCompletionStatus

export function useGetMissionCompletion(): FrontCompletionStatus {
  const draft = useMainAppSelector(state => state.missionForm.draft)
  const completion = getMissionCompletion(draft)

  if (!draft?.mainFormValues) {
    return FrontCompletionStatus.TO_COMPLETE
  }

  const missionStatus = getMissionStatus(draft?.mainFormValues)

  return getMissionCompletionFrontStatus(missionStatus, completion)
}
