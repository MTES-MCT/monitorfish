import { closeDraw } from '@features/Draw/useCases/closeDraw'
import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { resetMissionActionCreations } from '@features/Mission/useCases/autoSaveMissionAction'

import type { MainAppThunk } from '@store'

export const cleanMissionForm = (): MainAppThunk => dispatch => {
  resetMissionActionCreations()
  dispatch(missionFormActions.resetMissionForm())
  dispatch(missionFormActions.unsetSelectedMissionGeoJSON())
  dispatch(closeDraw())
}
