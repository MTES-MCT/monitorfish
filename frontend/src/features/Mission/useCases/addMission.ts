import { SideWindowMenuKey } from '../../../domain/entities/sideWindow/constants'
import { displayedErrorActions } from '../../../domain/shared_slices/DisplayedError'
import { openSideWindowPath } from '../../SideWindow/useCases/openSideWindowPath'
import { missionFormActions } from '../components/MissionForm/slice'
import { getMissionDraftFromPartialMainFormValues } from '../components/MissionForm/utils/getMissionDraftFromPartialMainFormValues'

import type { MainAppThunk } from '../../../store'
import type { MissionMainFormValues } from '../../SideWindow/MissionForm/types'

export const addMission =
  (initialMainFormValues: Partial<MissionMainFormValues> = {}): MainAppThunk =>
  dispatch => {
    const newDraft = getMissionDraftFromPartialMainFormValues(initialMainFormValues)

    dispatch(displayedErrorActions.unset('missionFormError'))
    dispatch(missionFormActions.initializeDraft(newDraft))
    dispatch(
      openSideWindowPath({
        id: 'new',
        menu: SideWindowMenuKey.MISSION_FORM
      })
    )
  }
