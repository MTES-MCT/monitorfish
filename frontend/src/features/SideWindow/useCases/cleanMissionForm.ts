import { closeDraw } from '@features/Draw/useCases/closeDraw'
import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { resetMissionActionSaves } from '@features/Mission/useCases/autoSaveMissionAction'
import { resetMissionSaves } from '@features/Mission/useCases/saveMission'

import type { MainAppThunk } from '@store'

export const cleanMissionForm = (): MainAppThunk => dispatch => {
  resetMissionActionSaves()
  resetMissionSaves()
  dispatch(missionFormActions.resetMissionForm())
  dispatch(missionFormActions.unsetSelectedMissionGeoJSON())
  dispatch(closeDraw())
}
