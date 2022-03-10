import { createSlice } from '@reduxjs/toolkit'
import { BeaconMalfunctionsTab } from '../entities/beaconMalfunction'

/* eslint-disable */
/** @namespace BeaconMalfunctionReducer */
const BeaconMalfunctionReducer = null
/* eslint-enable */

const beaconMalfunctionSlice = createSlice({
  name: 'beaconMalfunction',
  initialState: {
    /** @type {BeaconMalfunction[]} */
    beaconMalfunctions: [],
    /** @type {BeaconMalfunctionResumeAndDetails || null} */
    openedBeaconMalfunctionInKanban: null,
    /** @type {VesselBeaconMalfunctionsResumeAndHistory || null} */
    vesselBeaconMalfunctionsResumeAndHistory: null,
    /** @type {BeaconMalfunctionResumeAndDetails || null} */
    openedBeaconMalfunction: null,
    /** @type {Date} */
    vesselBeaconMalfunctionsFromDate: new Date(new Date().getUTCFullYear() - 3, 0, 1),
    loadingVesselBeaconMalfunctions: false,
    beaconMalfunctionsTab: BeaconMalfunctionsTab.RESUME
  },
  reducers: {
    /**
     * Set window malfunctions showed in the side window kanban
     * @function setBeaconMalfunctions
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: BeaconMalfunction[]}} action - the beacon malfunctions
     */
    setBeaconMalfunctions (state, action) {
      state.beaconMalfunctions = action.payload
    },
    /**
     * Update a single beacon malfunction in the kanban
     * @function updateLocalBeaconMalfunctions
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: BeaconMalfunction}} action - the beacon malfunction to update
     */
    updateLocalBeaconMalfunctions (state, action) {
      const id = action.payload?.id
      const nextBeaconMalfunctions = state.beaconMalfunctions.filter(beaconMalfunction => beaconMalfunction.id !== id)

      state.beaconMalfunctions = [
        action.payload,
        ...nextBeaconMalfunctions
      ]
    },
    /**
     * Open a beacon malfunction in the side window kanban
     * @function setOpenedBeaconMalfunctionsInKanban
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: BeaconMalfunctionResumeAndDetails}} action - the beacon malfunction to open
     */
    setOpenedBeaconMalfunctionsInKanban (state, action) {
      state.openedBeaconMalfunctionInKanban = action.payload
    },
    /**
     * Close a single beacon malfunction in the side window kanban
     * @function closeBeaconMalfunctionInKanban
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     */
    closeBeaconMalfunctionInKanban (state) {
      state.openedBeaconMalfunctionInKanban = null
    },
    /**
     * Set selected vessel beacon malfunctions resume and history
     * @function setVesselBeaconMalfunctionsResumeAndHistory
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: VesselBeaconMalfunctionsResumeAndHistory}} action
     */
    setVesselBeaconMalfunctionsResumeAndHistory (state, action) {
      state.vesselBeaconMalfunctionsResumeAndHistory = action.payload
      state.loadingVesselBeaconMalfunctions = false
    },
    /**
     * Set the date since beacon malfunctions are fetched
     * @function setVesselBeaconMalfunctionsFromDate
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: Date}} action - The "from" date
     */
    setVesselBeaconMalfunctionsFromDate (state, action) {
      state.vesselBeaconMalfunctionsFromDate = action.payload
    },
    /**
     * Set the loading of beacon malfunctions to true, and shows a loader in the ERS/VMS tab
     * @function loadVesselBeaconMalfunctions
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     */
    loadVesselBeaconMalfunctions (state) {
      state.loadingVesselBeaconMalfunctions = true
      state.openedBeaconMalfunction = null
      state.vesselBeaconMalfunctionsResumeAndHistory = null
      state.beaconMalfunctionsTab = BeaconMalfunctionsTab.RESUME
    },
    /**
     * Show the specified beacon malfunction tab (Resume or Detail)
     * @function setBeaconMalfunctionTab
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: number}} action - The tab
     */
    setBeaconMalfunctionsTab (state, action) {
      state.beaconMalfunctionsTab = action.payload
    },
    /**
     * Open a beacon malfunction
     * @function setOpenedBeaconMalfunction
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: BeaconMalfunctionResumeAndDetails}} action - the beacon malfunction to open
     */
    setOpenedBeaconMalfunction (state, action) {
      state.openedBeaconMalfunction = action.payload
      state.beaconMalfunctionsTab = BeaconMalfunctionsTab.DETAIL
    }
  }
})

export const {
  setBeaconMalfunctions,
  updateLocalBeaconMalfunctions,
  setOpenedBeaconMalfunctionsInKanban,
  closeBeaconMalfunctionInKanban,
  setVesselBeaconMalfunctionsResumeAndHistory,
  setVesselBeaconMalfunctionsFromDate,
  loadVesselBeaconMalfunctions,
  setBeaconMalfunctionsTab,
  setOpenedBeaconMalfunction
} = beaconMalfunctionSlice.actions

export default beaconMalfunctionSlice.reducer
