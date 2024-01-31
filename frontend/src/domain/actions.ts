import { missionDispatchers } from './use_cases/mission'
import { missionSliceActions } from '../features/SideWindow/MissionForm/slice'

export const missionActions = {
  ...missionDispatchers,
  ...missionSliceActions
}
