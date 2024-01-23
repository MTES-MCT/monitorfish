import { createSlice, current } from '@reduxjs/toolkit'
import { isEqual } from 'lodash/fp'

import { Mission } from '../../../domain/entities/mission/types'
import { SeaFrontGroup } from '../../../domain/entities/seaFront/constants'
import { MissionDateRangeFilter, MissionFilterType } from '../MissionList/types'

import type { MissionActionFormValues, MissionMainFormValues } from './types'
import type { GeoJSON } from '../../../domain/types/GeoJSON'
import type { FilterValues } from '../MissionList/types'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface MissionState {
  /**
   * Current mission form values.
   *
   * @description
   * We use `mission.draft` in 3 cases:
   * - For some mission draft interactions on the map
   * - To update location
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
  listFilterValues: FilterValues
  listSeaFront: SeaFrontGroup
  mustResetOtherControlsCheckboxes: boolean | undefined
  selectedMissionActionGeoJSON: GeoJSON.GeoJson | undefined
  selectedMissionGeoJSON: GeoJSON.GeoJson | undefined
}
const INITIAL_STATE: MissionState = {
  draft: undefined,
  geometryComputedFromControls: undefined,
  isClosing: false,
  isDraftDirty: false,
  isListeningToEvents: true,
  listFilterValues: {
    [MissionFilterType.DATE_RANGE]: MissionDateRangeFilter.WEEK,
    [MissionFilterType.STATUS]: [Mission.MissionStatus.IN_PROGRESS]
  },
  listSeaFront: SeaFrontGroup.MED,
  mustResetOtherControlsCheckboxes: undefined,
  selectedMissionActionGeoJSON: undefined,
  selectedMissionGeoJSON: undefined
}

const missionSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'mission',
  reducers: {
    mustResetOtherControlsCheckboxes(state, action: PayloadAction<boolean>) {
      state.mustResetOtherControlsCheckboxes = action.payload
    },

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
      state.isClosing = false
      state.isDraftDirty = false
      state.geometryComputedFromControls = undefined
    },

    /**
     * Unset geometry computed from controls to permit another modification of the mission's geometry
     * after adding another control to a mission.
     */
    unsetGeometryComputedFromControls(state) {
      state.geometryComputedFromControls = undefined
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
