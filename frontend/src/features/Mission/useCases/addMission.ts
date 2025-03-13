import { SideWindowMenuKey, SideWindowStatus } from '@features/SideWindow/constants'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { displayedErrorActions } from 'domain/shared_slices/DisplayedError'

import { askForSideWindowDraftCancellationConfirmation } from '../../SideWindow/useCases/askForSideWindowDraftCancellationConfirmation'
import { openSideWindowPath } from '../../SideWindow/useCases/openSideWindowPath'
import { missionFormActions } from '../components/MissionForm/slice'
import { getMissionDraftFromPartialMainFormValues } from '../components/MissionForm/utils/getMissionDraftFromPartialMainFormValues'

import type { MissionMainFormValues } from '../components/MissionForm/types'
import type { MainAppThunk } from '@store'

export const addMission =
  (initialMainFormValues: Partial<MissionMainFormValues> = {}): MainAppThunk =>
  (dispatch, getState) => {
    const { missionForm, sideWindow } = getState()
    const path = { id: 'new', menu: SideWindowMenuKey.MISSION_FORM }

    if (
      sideWindow.status !== SideWindowStatus.CLOSED &&
      sideWindow.selectedPath.menu === SideWindowMenuKey.MISSION_FORM &&
      missionForm.isDraftDirty
    ) {
      dispatch(
        askForSideWindowDraftCancellationConfirmation(path, () => addMissionWithoutConfirmation(initialMainFormValues))
      )

      return
    }

    dispatch(addMissionWithoutConfirmation(initialMainFormValues))
    dispatch(openSideWindowPath(path, true))
  }

const addMissionWithoutConfirmation =
  (initialMainFormValues: Partial<MissionMainFormValues> = {}): MainAppThunk =>
  dispatch => {
    const newDraft = getMissionDraftFromPartialMainFormValues(initialMainFormValues)

    dispatch(displayedErrorActions.unset(DisplayedErrorKey.MISSION_FORM_ERROR))
    dispatch(missionFormActions.initializeDraft(newDraft))
  }
