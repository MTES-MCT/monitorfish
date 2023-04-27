import { createSlice } from '@reduxjs/toolkit'
import { omit, remove, update } from 'ramda'

import { SeaFrontGroup } from '../../constants'
import { getMissionFormInitialValues } from '../../features/SideWindow/MissionForm/utils'
import { MissionDateRangeFilter, MissionFilterType } from '../../features/SideWindow/MissionList/types'
import { FrontendError } from '../../libs/FrontendError'

import type { MissionActionFormValues, MissionFormValues } from '../../features/SideWindow/MissionForm/types'
import type { FilterValues } from '../../features/SideWindow/MissionList/types'
import type { Mission } from '../entities/mission/types'
import type { GeoJSON } from '../types/GeoJSON'
import type { MissionAction } from '../types/missionAction'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface MissionState {
  draft: MissionFormValues | undefined
  draftId: Mission.Mission['id'] | undefined
  editedDraftActionIndex: number | undefined
  listFilterValues: FilterValues
  listSeaFront: SeaFrontGroup
  selectedMissionActionGeoJSON: GeoJSON.GeoJson | undefined
  selectedMissionGeoJSON: GeoJSON.GeoJson | undefined
}
const INITIAL_STATE: MissionState = {
  draft: getMissionFormInitialValues(undefined, []),
  draftId: undefined,
  editedDraftActionIndex: undefined,
  listFilterValues: {
    [MissionFilterType.DATE_RANGE]: MissionDateRangeFilter.CURRENT_MONTH
  },
  listSeaFront: SeaFrontGroup.MED,
  selectedMissionActionGeoJSON: undefined,
  selectedMissionGeoJSON: undefined
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
        throw new FrontendError('`state.draft` is undefined')
      }

      const nextDraft = {
        ...state.draft,
        actions: [action.payload, ...state.draft.actions]
      }

      state.draft = nextDraft
      state.editedDraftActionIndex = 0
    },

    /**
     * Duplicate a mission draft action by its index
     */
    duplicateDraftActionAtIndex(state, action: PayloadAction<number>) {
      if (!state.draft) {
        throw new FrontendError('`state.draft` is undefined')
      }

      const sourceDraftAction = state.draft.actions[action.payload]
      if (!sourceDraftAction) {
        throw new FrontendError('`sourceDraftAction` is undefined')
      }
      const duplicatedAction = omit(['id'], sourceDraftAction)

      const nextDraft = {
        ...state.draft,
        actions: [duplicatedAction, ...state.draft.actions]
      }

      state.draft = nextDraft
      state.editedDraftActionIndex = 0
    },

    /**
     * Initialize mission draft either from scratch (with an `undefined` payload) or from a mission and its actions
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
        state.draftId = undefined

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
        throw new FrontendError('`state.draft` is undefined')
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
      // We have to reset the `draft` since it's a new mission draft
      state.draft = undefined
      state.draftId = action.payload
      // We have to reset the `editedDraftActionIndex` since it's a new mission draft
      state.editedDraftActionIndex = undefined
    },

    /**
     * Update edited mission action in mission draft values
     */
    setEditedDraftAction(state, action: PayloadAction<MissionActionFormValues>) {
      if (!state.draft || !state.draft.actions || state.editedDraftActionIndex === undefined) {
        throw new FrontendError(
          'Either `state.draft`, `state.draft.actions` or `state.editedDraftActionIndex` is undefined'
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
        throw new FrontendError('`state.draft` is undefined')
      }
      if (!state.draft.actions[action.payload]) {
        throw new FrontendError(`\`state.draft.actions[${action.payload}]\` is undefined`)
      }

      state.editedDraftActionIndex = action.payload
    },

    /**
     * Set filter values in missions list
     */
    setListFilterValues(state, action: PayloadAction<FilterValues>) {
      state.listFilterValues = action.payload
    },

    /**
     * Set sea front filter in missions list
     */
    setListSeaFront(state, action: PayloadAction<SeaFrontGroup>) {
      state.listSeaFront = action.payload
    },

    /**
     * Set selected mission action GeoJSON
     */
    setSelectedMissionActionGeoJSON(state, action: PayloadAction<GeoJSON.GeoJson>) {
      state.selectedMissionActionGeoJSON = action.payload
    },

    /**
     * Set selected mission GeoJSON
     */
    setSelectedMissionGeoJSON(state, action: PayloadAction<GeoJSON.GeoJson>) {
      state.selectedMissionGeoJSON = action.payload
    },

    /**
     * Unset mission draft
     */
    unsetDraft(state) {
      state.draft = undefined
      state.draftId = undefined
      state.editedDraftActionIndex = undefined
    },

    /**
     * Unset currently edited mission action
     */
    unsetEditedDraftActionIndex(state) {
      state.editedDraftActionIndex = undefined
    },

    /**
     * Unset selected mission action GeoJSON
     */
    unsetSelectedMissionActionGeoJSON(state) {
      state.selectedMissionActionGeoJSON = undefined
    },

    /**
     * Unset selected mission ID
     */
    unsetSelectedMissionGeoJSON(state) {
      state.selectedMissionGeoJSON = undefined
      state.selectedMissionActionGeoJSON = undefined
    }
  }
})

export const missionSliceActions = missionSlice.actions

export const missionReducer = missionSlice.reducer
