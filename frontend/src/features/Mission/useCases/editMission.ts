import { getMissionWithActions } from './getMissionWithActions'
import { SideWindowMenuKey } from '../../../domain/entities/sideWindow/constants'
import { displayedErrorActions } from '../../../domain/shared_slices/DisplayedError'
import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { FrontendApiError } from '../../../libs/FrontendApiError'
import { handleThunkError } from '../../../utils/handleThunkError'
import { openSideWindowPath } from '../../SideWindow/useCases/openSideWindowPath'
import { missionFormActions } from '../components/MissionForm/slice'
import { getMissionDraftFromMissionWithActions } from '../components/MissionForm/utils/getMissionFormInitialValues'

import type { MainAppThunk } from '../../../store'

export const editMission =
  (id: number): MainAppThunk =>
  async dispatch => {
    dispatch(displayedErrorActions.unset('missionFormError'))
    dispatch(
      openSideWindowPath({
        id,
        isLoading: true,
        menu: SideWindowMenuKey.MISSION_FORM
      })
    )

    try {
      const missionWithActions = await dispatch(getMissionWithActions(id))

      const nextDraft = getMissionDraftFromMissionWithActions(missionWithActions)

      dispatch(missionFormActions.initializeDraft(nextDraft))
      dispatch(sideWindowActions.setSelectedPathIsLoading(false))
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(displayOrLogError(err, () => editMission(id), true, 'missionFormError'))

        return
      }

      handleThunkError(err)
    }
  }
