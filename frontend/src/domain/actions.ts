import { missionSliceActions } from './shared_slices/Mission'
import { missionDispatchers } from './use_cases/missions'

export const missionActions = {
  ...missionDispatchers,
  ...missionSliceActions
}
