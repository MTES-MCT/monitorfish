import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { monitorfishMissionApi } from '@features/Mission/monitorfishMissionApi'
import { sideWindowActions } from '@features/SideWindow/slice'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { SideWindowMenuKey, SideWindowStatus } from 'domain/entities/sideWindow/constants'
import { displayedErrorActions } from 'domain/shared_slices/DisplayedError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { FrontendApiError } from '../../../libs/FrontendApiError'
import { handleThunkError } from '../../../utils/handleThunkError'
import { askForSideWindowDraftCancellationConfirmation } from '../../SideWindow/useCases/askForSideWindowDraftCancellationConfirmation'
import { missionFormActions } from '../components/MissionForm/slice'
import { getMissionDraftFromMissionWithActions } from '../components/MissionForm/utils/getMissionFormInitialValues'

import type { MainAppThunk } from '@store'

export const editMission =
  (id: number): MainAppThunk =>
  async (dispatch, getState) => {
    const { missionForm, sideWindow } = getState()
    const path = { id, isLoading: true, menu: SideWindowMenuKey.MISSION_FORM }

    if (
      sideWindow.status !== SideWindowStatus.CLOSED &&
      sideWindow.selectedPath.menu === SideWindowMenuKey.MISSION_FORM &&
      missionForm.isDraftDirty
    ) {
      dispatch(askForSideWindowDraftCancellationConfirmation(path, () => editMissionWithoutConfirmation(id)))

      return
    }

    dispatch(editMissionWithoutConfirmation(id))
    dispatch(openSideWindowPath(path, true))
  }

const editMissionWithoutConfirmation =
  (id: number): MainAppThunk =>
  async dispatch => {
    dispatch(displayedErrorActions.unset(DisplayedErrorKey.MISSION_FORM_ERROR))

    try {
      dispatch(missionFormActions.reset())

      const missionWithActions = await dispatch(
        monitorfishMissionApi.endpoints.getMission.initiate(id, RTK_FORCE_REFETCH_QUERY_OPTIONS)
      ).unwrap()
      const nextDraft = getMissionDraftFromMissionWithActions(missionWithActions)

      dispatch(missionFormActions.initializeDraft(nextDraft))
      dispatch(sideWindowActions.setSelectedPathIsLoading(false))
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(
          displayOrLogError(err, () => editMissionWithoutConfirmation(id), true, DisplayedErrorKey.MISSION_FORM_ERROR)
        )

        return
      }

      handleThunkError(err)
    }
  }
