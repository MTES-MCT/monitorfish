import { missionSliceActions } from './shared_slices/Mission'
import { missionDispatchers } from './use_cases/mission'

export const missionActions = {
  ...missionDispatchers,
  ...missionSliceActions
}
