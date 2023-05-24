import { createSlice, current } from '@reduxjs/toolkit'
import { isEqual } from 'lodash'
import { omit, remove, update } from 'ramda'

import { SeaFrontGroup } from '../../constants'
import { getMissionFormInitialValues } from '../../features/SideWindow/MissionForm/utils'
import { MissionDateRangeFilter, MissionFilterType } from '../../features/SideWindow/MissionList/types'
import { FrontendError } from '../../libs/FrontendError'
import { Mission } from '../entities/mission/types'

import type { MissionActionFormValues, MissionFormValues } from '../../features/SideWindow/MissionForm/types'
import type { FilterValues } from '../../features/SideWindow/MissionList/types'
import type { GeoJSON } from '../types/GeoJSON'
import type { MissionAction } from '../types/missionAction'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface MissionState {
  draft: MissionFormValues | undefined
  editedDraftActionIndex: number | undefined
  isDraftDirty: boolean
  listFilterValues: FilterValues
  listSeaFront: SeaFrontGroup
  selectedMissionActionGeoJSON: GeoJSON.GeoJson | undefined
  selectedMissionGeoJSON: GeoJSON.GeoJson | undefined
}
const INITIAL_STATE: MissionState = {
  draft: undefined,
  editedDraftActionIndex: undefined,
  isDraftDirty: false,
  listFilterValues: {
    [MissionFilterType.DATE_RANGE]: MissionDateRangeFilter.WEEK,
    [MissionFilterType.STATUS]: [Mission.MissionStatus.IN_PROGRESS]
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

      const currentDraft = current(state.draft)
      const nextDraft = {
        ...currentDraft,
        actions: [action.payload, ...currentDraft.actions]
      }

      state.draft = nextDraft
      state.editedDraftActionIndex = 0

      if (!state.isDraftDirty) {
        state.isDraftDirty = true
      }
    },

    /**
     * Duplicate a mission draft action by its index
     */
    duplicateDraftActionAtIndex(state, action: PayloadAction<number>) {
      if (!state.draft) {
        throw new FrontendError('`state.draft` is undefined')
      }

      const currentDraft = current(state.draft)
      const sourceDraftAction = currentDraft.actions[action.payload]
      if (!sourceDraftAction) {
        throw new FrontendError('`sourceDraftAction` is undefined')
      }
      const duplicatedAction = omit(['id'], sourceDraftAction)

      const nextDraft = {
        ...currentDraft,
        actions: [duplicatedAction, ...currentDraft.actions]
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

        return
      }

      state.draft = getMissionFormInitialValues(action.payload.mission, action.payload.missionActions)
    },

    /**
     * Remove a mission draft action by its index
     */
    removeDraftActionAtIndex(state, action: PayloadAction<number>) {
      if (!state.draft) {
        throw new FrontendError('`state.draft` is undefined')
      }

      state.draft = {
        ...current(state.draft),
        actions: remove(action.payload, 1, current(state.draft.actions))
      }

      // If we removed the currently edited mission draft action, we also must unset that
      if (action.payload === state.editedDraftActionIndex) {
        state.editedDraftActionIndex = undefined
      }

      if (!state.isDraftDirty) {
        state.isDraftDirty = true
      }
    },

    /**
     * Update mission draft
     *
     * @description
     * This is used to synchronize the creation/edition form values with the Local Storage via `redux-persist`.
     */
    setDraft(state, action: PayloadAction<MissionFormValues>) {
      const currentDraft = current(state.draft)
      const nextDraft = {
        ...omit(['actions'], action.payload),
        actions: currentDraft ? currentDraft.actions : []
      }

      if (!state.isDraftDirty && state.draft && !isEqual(nextDraft, currentDraft)) {
        state.isDraftDirty = true
      }

      state.draft = nextDraft
    },

    /**
     * Update mission action at <index> in mission draft values
     */
    setDraftAction(
      state,
      action: PayloadAction<{
        index: number
        nextAction: MissionActionFormValues
      }>
    ) {
      if (!state.draft) {
        throw new FrontendError('`state.draft` is undefined.')
      }
      if (!state.draft.actions) {
        throw new FrontendError('`state.draft.actions` is undefined.')
      }
      if (state.editedDraftActionIndex === undefined) {
        throw new FrontendError('`state.editedDraftActionIndex` is undefined.')
      }

      if (!state.draft.actions[action.payload.index]) {
        throw new FrontendError(`\`state.draft.actions[${action.payload.index}]\` is undefined.`)
      }

      const nextDraft = {
        ...state.draft,
        actions: update(action.payload.index, action.payload.nextAction, state.draft.actions)
      }

      if (!state.isDraftDirty && state.draft && !isEqual(nextDraft, current(state.draft))) {
        state.isDraftDirty = true
      }

      state.draft = nextDraft
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
      state.editedDraftActionIndex = undefined
      state.isDraftDirty = false
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
