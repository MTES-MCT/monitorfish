import { createSlice } from '@reduxjs/toolkit'

import type { MissionFormValues } from '../../features/SideWindow/MissionForm/MainForm/types'
import type { Mission } from '../types/mission'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface MissionState {
  draftFormValues: MissionFormValues | undefined
  editedMission: Mission | undefined
}
const INITIAL_STATE: MissionState = {
  draftFormValues: undefined,
  editedMission: undefined
}

const missionSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'mission',
  reducers: {
    /**
     * Set mission draft Formik form values
     *
     * @description
     * This is used to synchronize the creation/edition form values with the Local Storage via `redux-persist`.
     */
    setDraftFormValues(state, action: PayloadAction<MissionFormValues>) {
      state.draftFormValues = action.payload
    },

    /**
     * Set the edited mission
     */
    setEditedMission(state, action: PayloadAction<Mission>) {
      state.editedMission = action.payload
    },

    /**
     * Unset mission draft Formik form values
     */
    unsetDraftFormValues(state) {
      state.draftFormValues = undefined
    },

    /**
     * Unset the edited mission
     */
    unsetEditedMission(state) {
      state.editedMission = undefined
    }
  }
})

export const missionSliceActions = missionSlice.actions

export const missionReducer = missionSlice.reducer
