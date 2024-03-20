import { closeDraw } from '@features/Draw/useCases/closeDraw'
import { missionFormActions } from '@features/Mission/components/MissionForm/slice'

import type { MainAppThunk } from '@store'

export const cleanMissionForm = (): MainAppThunk => dispatch => {
  dispatch(missionFormActions.resetMissionForm())
  dispatch(missionFormActions.unsetSelectedMissionGeoJSON())
  dispatch(closeDraw())
}
