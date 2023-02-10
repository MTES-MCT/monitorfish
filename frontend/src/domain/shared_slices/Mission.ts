import { createSlice } from '@reduxjs/toolkit'
import { omit, remove, update } from 'ramda'

import { getMissionFormInitialValues } from '../../features/SideWindow/MissionForm/utils'
import { FrontendError } from '../../libs/FrontendError'

import type { MissionActionFormValues, MissionFormValues } from '../../features/SideWindow/MissionForm/types'
import type { Mission } from '../types/mission'
import type { MissionAction } from '../types/missionAction'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface MissionState {
  draft: MissionFormValues | undefined
  draftId: Mission.Mission['id'] | undefined
  editedDraftActionIndex: number | undefined
}
const INITIAL_STATE: MissionState = {
  draft: getMissionFormInitialValues(undefined, []),
  draftId: undefined,
  editedDraftActionIndex: undefined
}

const missionSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'mission',
  reducers: {
    /**
     * Add a new action in mission draft and make it the currently edited
     */
    addDraftAction(state, action: PayloadAction<MissionActionFormValues>) {
      if (!state.draft) {
        throw new FrontendError(
          '`state.draft` is undefined. This should never happen.',
          'domain/shared_slices/Mission.ts > addDraftAction()'
        )
      }

      const nextDraft = {
        ...state.draft,
        actions: [...state.draft.actions, action.payload]
      }

      state.draft = nextDraft
      state.editedDraftActionIndex = nextDraft.actions.length - 1
    },

    /**
     * Duplicate a mission draft action by its index
     */
    duplicateDraftActionAtIndex(state, action: PayloadAction<number>) {
      if (!state.draft) {
        throw new FrontendError(
          '`state.draft` is undefined. This should never happen.',
          'domain/shared_slices/Mission.ts > duplicateDraftActionAtIndex()'
        )
      }

      const sourceDraftAction = state.draft.actions[action.payload]
      if (!sourceDraftAction) {
        throw new FrontendError(
          '`sourceDraftAction` is undefined. This should never happen.',
          'domain/shared_slices/Mission.ts > duplicateDraftActionAtIndex()'
        )
      }

      const nextDraft = {
        ...state.draft,
        actions: [...state.draft.actions, { ...sourceDraftAction }]
      }

      state.draft = nextDraft
      state.editedDraftActionIndex = nextDraft.actions.length - 1
    },

    /**
     * Initialize mission draft either from scratch or from a mission and its actions
     */
    initializeDraft(
      state,
      action: PayloadAction<
        | {
            mission: Mission.Mission
            missionActions: MissionAction.MissionAction[]
          }
        | undefined
      >
    ) {
      if (!action.payload) {
        state.draft = getMissionFormInitialValues(undefined, [])

        return
      }

      state.draft = getMissionFormInitialValues(action.payload.mission, action.payload.missionActions)
      state.draftId = action.payload.mission.id
    },

    /**
     * Remove a mission draft action by its index
     */
    removeDraftActionAtIndex(state, action: PayloadAction<number>) {
      if (!state.draft) {
        throw new FrontendError(
          '`state.draft` is undefined. This should never happen.',
          'domain/shared_slices/Mission.ts > removeDraftActionAtIndex()'
        )
      }

      state.draft = {
        ...state.draft,
        actions: remove(action.payload, 1, state.draft.actions)
      }

      // If we removed the currently edited mission draft action, we also must unset that
      if (action.payload === state.editedDraftActionIndex) {
        state.editedDraftActionIndex = undefined
      }
    },

    /**
     * Update mission draft
     *
     * @description
     * This is used to synchronize the creation/edition form values with the Local Storage via `redux-persist`.
     */
    setDraft(state, action: PayloadAction<MissionFormValues>) {
      state.draft = {
        ...omit(['actions'], action.payload),
        actions: state.draft ? state.draft.actions : []
      }
    },

    /**
     * Set mission draft ID (= missionId to edit)
     */
    setDraftId(state, action: PayloadAction<Mission.Mission['id']>) {
      state.draftId = action.payload
    },

    /**
     * Update edited mission action in mission draft values
     */
    setEditedDraftAction(state, action: PayloadAction<MissionActionFormValues>) {
      if (!state.draft || !state.draft.actions || state.editedDraftActionIndex === undefined) {
        throw new FrontendError(
          'Either  `state.draft`, `state.draft.actions` or `state.editedDraftActionIndex` is undefined. This should never happen.',
          'domain/shared_slices/Mission.ts > setDraftAction()'
        )
      }

      state.draft = {
        ...state.draft,
        actions: update(state.editedDraftActionIndex, action.payload, state.draft.actions)
      }
    },
    /**
     * Add a new action in mission draft and make it the currently edited
     */
    setEditedDraftActionIndex(state, action: PayloadAction<number>) {
      if (!state.draft) {
        throw new FrontendError(
          '`state.draft` is undefined. This should never happen.',
          'domain/shared_slices/Mission.ts > setEditedDraftActionIndex()'
        )
      }
      if (!state.draft.actions[action.payload]) {
        throw new FrontendError(
          `\`state.draft.actions[${action.payload}]\` is undefined. This should never happen.`,
          'domain/shared_slices/Mission.ts > setEditedDraftActionIndex()'
        )
      }

      state.editedDraftActionIndex = action.payload
    },

    /**
     * Unset mission draft
     */
    unsetDraft(state) {
      state.draft = undefined
      state.draftId = undefined
    },

    /**
     * Unset currently edited mission action
     */
    unsetEditedDraftActionIndex(state) {
      state.editedDraftActionIndex = undefined
    }
  }
})

export const missionSliceActions = missionSlice.actions

export const missionReducer = missionSlice.reducer
