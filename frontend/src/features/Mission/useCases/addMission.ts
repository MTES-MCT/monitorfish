import { SideWindowMenuKey } from '../../../domain/entities/sideWindow/constants'
import { sideWindowDispatchers } from '../../../domain/use_cases/sideWindow'
import { getMissionFormInitialValues } from '../../SideWindow/MissionForm/utils/getMissionFormInitialValues'

import type { MainAppThunk } from '../../../store'
import type { MissionActionFormValues, MissionMainFormValues } from '../../SideWindow/MissionForm/types'

export const addMission =
  (initialValues?: {
    actionsFormValues?: MissionActionFormValues[]
    mainFormValues?: MissionMainFormValues
  }): MainAppThunk =>
  dispatch => {
    const mainFormValues =
      initialValues?.mainFormValues || getMissionFormInitialValues(undefined, []).initialMainFormValues

    dispatch(
      sideWindowDispatchers.openPath({
        initialData: {
          actionsFormValues: initialValues?.actionsFormValues || [],
          mainFormValues
        },
        menu: SideWindowMenuKey.MISSION_FORM
      })
    )
  }
