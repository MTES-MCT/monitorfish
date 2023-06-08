import { createSlice, current } from '@reduxjs/toolkit'
import { isEqual } from 'lodash/fp'

import { MissionDateRangeFilter, MissionFilterType } from '../../features/SideWindow/MissionList/types'
import { Mission } from '../entities/mission/types'
import { SeaFrontGroup } from '../entities/seaFront/constants'

import type { MissionActionFormValues, MissionMainFormValues } from '../../features/SideWindow/MissionForm/types'
import type { FilterValues } from '../../features/SideWindow/MissionList/types'
import type { GeoJSON } from '../types/GeoJSON'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface MissionState {
  /**
   * Current mission form values.
   *
   * @description
   * We use `mission.draft` in 3 cases:
   * - For some mission draft interactions on the map
   * - To prevent side window closure when a draft is in progress
   * - For cross-form validation (some actions validations depends on current main form values)
   */
  // TODO For side window closure prevention and cross-form validation we don't need the entire forms values.
  // But we do for the map interactions.
  draft:
    | {
        actionsFormValues: MissionActionFormValues[]
        mainFormValues: MissionMainFormValues
      }
    | undefined
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
     * Update mission draft
     */
    setDraft(
      state,
      action: PayloadAction<{
        actionsFormValues: MissionActionFormValues[]
        mainFormValues: MissionMainFormValues
      }>
    ) {
      if (!state.isDraftDirty && state.draft && !isEqual(current(state.draft), action.payload)) {
        state.isDraftDirty = true
      }

      state.draft = action.payload
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
      state.isDraftDirty = false
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
