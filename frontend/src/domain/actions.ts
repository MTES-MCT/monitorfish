import { missionSliceActions } from './shared_slices/Mission'
import { missionDispatchers } from './use_cases/missions'
import { missionApi } from '../api/mission'

export const missionActions = {
  ...missionSliceActions,
  ...missionDispatchers,
  ...missionApi
}
