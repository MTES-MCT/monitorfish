import { createSlice, current } from '@reduxjs/toolkit'
import { isEqual } from 'lodash-es'

import type { MissionMainFormValues } from './types'
import type { MissionWithActionsDraft } from '../../types'
import type { ControlUnit } from '@mtes-mct/monitor-ui'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Feature, Point } from 'geojson'

export interface MissionFormState {
  draft: MissionWithActionsDraft | undefined
  engagedControlUnit: ControlUnit.EngagedControlUnit | undefined
  geometryComputedFromControls: MissionMainFormValues['geom']
  isDraftDirty: boolean
  isListeningToEvents: boolean
  isMissionCreatedBannerDisplayed: boolean
  mustResetOtherControlsCheckboxes: boolean | undefined
  selectedMissionActionGeoJSON: Feature<Point> | undefined
  selectedMissionGeoJSON: Feature<Point> | undefined
}
const INITIAL_STATE: MissionFormState = {
  draft: undefined,
  engagedControlUnit: undefined,
  geometryComputedFromControls: undefined,
  isDraftDirty: false,
  isListeningToEvents: false,
  isMissionCreatedBannerDisplayed: false,
  mustResetOtherControlsCheckboxes: undefined,
  selectedMissionActionGeoJSON: undefined,
  selectedMissionGeoJSON: undefined
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
      state.isDraftDirty = false
      state.isMissionCreatedBannerDisplayed = false
    },

    mustResetOtherControlsCheckboxes(state, action: PayloadAction<boolean>) {
      state.mustResetOtherControlsCheckboxes = action.payload
    },

    /**
     * Reset mission form state
     */
    reset: () => INITIAL_STATE,

    /**
     * Reset mission form state
     */
    resetMissionForm(state) {
      state.draft = undefined
      state.geometryComputedFromControls = undefined
      state.isDraftDirty = false
      state.isMissionCreatedBannerDisplayed = false
    },

    /**
     * Update mission form draft.
     */
    setDraft(state, action: PayloadAction<MissionWithActionsDraft>) {
      state.draft = action.payload
    },

    setEngagedControlUnit(state, action: PayloadAction<ControlUnit.EngagedControlUnit | undefined>) {
      state.engagedControlUnit = action.payload
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
     * Update isDraftDirty
     */
    setIsDraftDirty(state, action: PayloadAction<boolean>) {
      state.isDraftDirty = action.payload
    },

    setIsListeningToEvents(state, action: PayloadAction<boolean>) {
      state.isListeningToEvents = action.payload
    },

    setIsMissionCreatedBannerDisplayed(state, action: PayloadAction<boolean>) {
      state.isMissionCreatedBannerDisplayed = action.payload
    },

    /**
     * Set selected mission action GeoJSON.
     */
    setSelectedMissionActionGeoJSON(state, action: PayloadAction<Feature<Point>>) {
      state.selectedMissionActionGeoJSON = action.payload
    },

    /**
     * Set selected mission GeoJSON.
     */
    setSelectedMissionGeoJSON(state, action: PayloadAction<Feature<Point>>) {
      state.selectedMissionGeoJSON = action.payload
    },

    /**
     * Unset geometry computed from controls to permit another modification of the mission's geometry
     * after adding another control to a mission.
     */
    unsetGeometryComputedFromControls(state) {
      state.geometryComputedFromControls = undefined
    },

    /**
     * Unset selected mission action GeoJSON.
     */
    unsetSelectedMissionActionGeoJSON(state) {
      state.selectedMissionActionGeoJSON = undefined
    },

    /**
     * Unset selected mission ID.
     */
    unsetSelectedMissionGeoJSON(state) {
      state.selectedMissionGeoJSON = undefined
      state.selectedMissionActionGeoJSON = undefined
    }
  }
})

export const missionFormActions = missionFormSlice.actions
export const missionFormReducer = missionFormSlice.reducer
