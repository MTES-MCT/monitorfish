import { createSlice, current } from '@reduxjs/toolkit'
import { isEqual } from 'lodash/fp'

import type { MissionMainFormValues } from './types'
import type { MissionWithActionsDraft } from '../../types'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface MissionFormState {
  // TODO For side window closure prevention and cross-form validation we don't need the entire forms values.
  // But we do for the map interactions.
  draft: MissionWithActionsDraft | undefined
  geometryComputedFromControls: MissionMainFormValues['geom']
  /**
   * Is the mission being closed?
   *
   * @description
   * Used to switch validation schemas from `Live` ones to 'Closure' ones when closing a mission.
   */
  isClosing: boolean
  isDraftDirty: boolean
  isListeningToEvents: boolean
  mustResetOtherControlsCheckboxes: boolean | undefined
}
const INITIAL_STATE: MissionFormState = {
  draft: undefined,
  geometryComputedFromControls: undefined,
  isClosing: false,
  isDraftDirty: false,
  isListeningToEvents: true,
  mustResetOtherControlsCheckboxes: undefined
}

const missionFormSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'mission',
  reducers: {
    /**
     * Initialize a mission form draft from scratch.
     */
    initializeDraft(state, action: PayloadAction<MissionWithActionsDraft>) {
      state.draft = action.payload
      state.geometryComputedFromControls = undefined
      state.isClosing = false
      state.isDraftDirty = false
    },

    mustResetOtherControlsCheckboxes(state, action: PayloadAction<boolean>) {
      state.mustResetOtherControlsCheckboxes = action.payload
    },

    /**
     * Reset mission form state
     */
    resetMissionForm(state) {
      state.draft = undefined
      state.geometryComputedFromControls = undefined
      state.isClosing = false
      state.isDraftDirty = false
    },

    /**
     * Update mission form draft.
     */
    setDraft(state, action: PayloadAction<MissionWithActionsDraft>) {
      state.draft = action.payload
    },

    /**
     * Update mission geometry computed from controls
     */
    setGeometryComputedFromControls(state, action: PayloadAction<MissionMainFormValues['geom']>) {
      if (state.geometryComputedFromControls && isEqual(current(state.geometryComputedFromControls), action.payload)) {
        return
      }

      state.geometryComputedFromControls = action.payload
    },

    /**
     * Set mission closure state
     */
    setIsClosing(state, action: PayloadAction<boolean>) {
      state.isClosing = action.payload
    },

    /**
     * Update isDraftDirty
     */
    setIsDraftDirty(state, action: PayloadAction<boolean>) {
      state.isDraftDirty = action.payload
    },

    setIsListeningToEvents(state, action: PayloadAction<boolean>) {
      state.isListeningToEvents = action.payload
    },

    /**
     * Unset geometry computed from controls to permit another modification of the mission's geometry
     * after adding another control to a mission.
     */
    unsetGeometryComputedFromControls(state) {
      state.geometryComputedFromControls = undefined
    }
  }
})

export const missionFormActions = missionFormSlice.actions
export const missionFormReducer = missionFormSlice.reducer
