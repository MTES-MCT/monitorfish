import { createSlice } from '@reduxjs/toolkit'

import { BeaconMalfunctionsTab } from '../entities/beaconMalfunction'

import type {
  BeaconMalfunction,
  BeaconMalfunctionResumeAndDetails,
  VesselBeaconMalfunctionsResumeAndHistory
} from '../types/beaconMalfunction'
import type { ValueOf } from 'type-fest'

export type BeaconMalfunctionState = {
  beaconMalfunctions: BeaconMalfunction[]
  // TODO Replace when converted to enum.
  beaconMalfunctionsTab: ValueOf<typeof BeaconMalfunctionsTab>
  loadingVesselBeaconMalfunctions: boolean
  openedBeaconMalfunction: BeaconMalfunctionResumeAndDetails | null
  openedBeaconMalfunctionInKanban: BeaconMalfunctionResumeAndDetails | null
  vesselBeaconMalfunctionsFromDate: Date
  vesselBeaconMalfunctionsResumeAndHistory: VesselBeaconMalfunctionsResumeAndHistory | null
}
const INITIAL_STATE: BeaconMalfunctionState = {
  beaconMalfunctions: [],
  beaconMalfunctionsTab: BeaconMalfunctionsTab.RESUME,
  loadingVesselBeaconMalfunctions: false,
  openedBeaconMalfunction: null,
  openedBeaconMalfunctionInKanban: null,
  vesselBeaconMalfunctionsFromDate: new Date(new Date().getUTCFullYear() - 3, 0, 1),
  vesselBeaconMalfunctionsResumeAndHistory: null
}

const beaconMalfunctionSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'beaconMalfunction',
  reducers: {
    /**
     * Close a single beacon malfunction in the side window kanban
     * @function closeBeaconMalfunctionInKanban
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     */
    closeBeaconMalfunctionInKanban(state) {
      state.openedBeaconMalfunctionInKanban = null
    },

    /**
     * Set the loading of beacon malfunctions to true, and shows a loader in the ERS/VMS tab
     * @function loadVesselBeaconMalfunctions
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     */
    loadVesselBeaconMalfunctions(state) {
      state.loadingVesselBeaconMalfunctions = true
      state.openedBeaconMalfunction = null
      state.vesselBeaconMalfunctionsResumeAndHistory = null
      state.beaconMalfunctionsTab = BeaconMalfunctionsTab.RESUME
    },

    /**
     * Reset selected vessel beacon malfunctions resume and history
     * @function resetVesselBeaconMalfunctionsResumeAndHistory
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     */
    resetVesselBeaconMalfunctionsResumeAndHistory(state) {
      state.vesselBeaconMalfunctionsResumeAndHistory = null
      state.openedBeaconMalfunction = null
      state.loadingVesselBeaconMalfunctions = false
    },

    /**
     * Set window malfunctions showed in the side window kanban
     * @function setBeaconMalfunctions
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: BeaconMalfunction[]}} action - the beacon malfunctions
     */
    setBeaconMalfunctions(state, action) {
      state.beaconMalfunctions = action.payload
    },

    /**
     * Show the specified beacon malfunction tab (Resume or Detail)
     * @function setBeaconMalfunctionTab
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: number}} action - The tab
     */
    setBeaconMalfunctionsTab(state, action) {
      state.beaconMalfunctionsTab = action.payload
    },

    /**
     * Open a beacon malfunction
     * @function setOpenedBeaconMalfunction
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: {
     *   beaconMalfunction: BeaconMalfunctionResumeAndDetails,
     *   showTab: boolean
     * }}} action - the beacon malfunction to open
     */
    setOpenedBeaconMalfunction(state, action) {
      state.openedBeaconMalfunction = action.payload.beaconMalfunction

      if (action.payload.showTab) {
        state.beaconMalfunctionsTab = BeaconMalfunctionsTab.DETAIL
      }
    },

    /**
     * Open a beacon malfunction in the side window kanban
     * @function setOpenedBeaconMalfunctionsInKanban
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: BeaconMalfunctionResumeAndDetails}} action - the beacon malfunction to open
     */
    setOpenedBeaconMalfunctionsInKanban(state, action) {
      state.openedBeaconMalfunctionInKanban = action.payload
    },

    /**
     * Set the date since beacon malfunctions are fetched
     * @function setVesselBeaconMalfunctionsFromDate
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: Date}} action - The "from" date
     */
    setVesselBeaconMalfunctionsFromDate(state, action) {
      state.vesselBeaconMalfunctionsFromDate = action.payload
    },

    /**
     * Set selected vessel beacon malfunctions resume and history
     * @function setVesselBeaconMalfunctionsResumeAndHistory
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: VesselBeaconMalfunctionsResumeAndHistory}} action
     */
    setVesselBeaconMalfunctionsResumeAndHistory(state, action) {
      state.vesselBeaconMalfunctionsResumeAndHistory = action.payload
      state.loadingVesselBeaconMalfunctions = false
    },

    /**
     * Update a single beacon malfunction in the kanban
     * @function updateLocalBeaconMalfunctions
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: BeaconMalfunction}} action - the beacon malfunction to update
     */
    updateLocalBeaconMalfunctions(state, action) {
      const id = action.payload?.id
      const nextBeaconMalfunctions = state.beaconMalfunctions.filter(beaconMalfunction => beaconMalfunction.id !== id)

      state.beaconMalfunctions = [action.payload, ...nextBeaconMalfunctions]
    },

    /**
     * Update the selected vessel beacon malfunctions resume and history
     * @function setVesselBeaconMalfunctionsResumeAndHistory
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: BeaconMalfunctionResumeAndDetails}} action
     */
    updateVesselBeaconMalfunctionsResumeAndHistory(state, action) {
      if (!state.vesselBeaconMalfunctionsResumeAndHistory) {
        return
      }

      state.vesselBeaconMalfunctionsResumeAndHistory = {
        ...state.vesselBeaconMalfunctionsResumeAndHistory,
        current: action.payload
      }
    }
  }
})

export const {
  closeBeaconMalfunctionInKanban,
  loadVesselBeaconMalfunctions,
  resetVesselBeaconMalfunctionsResumeAndHistory,
  setBeaconMalfunctions,
  setBeaconMalfunctionsTab,
  setOpenedBeaconMalfunction,
  setOpenedBeaconMalfunctionsInKanban,
  setVesselBeaconMalfunctionsFromDate,
  setVesselBeaconMalfunctionsResumeAndHistory,
  updateLocalBeaconMalfunctions,
  updateVesselBeaconMalfunctionsResumeAndHistory
} = beaconMalfunctionSlice.actions

export const beaconMalfunctionReducer = beaconMalfunctionSlice.reducer
