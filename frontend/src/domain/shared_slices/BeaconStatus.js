import { createSlice } from '@reduxjs/toolkit'
import { BeaconMalfunctionsTab } from '../entities/beaconStatus'

/* eslint-disable */
/** @namespace BeaconStatusReducer */
const BeaconStatusReducer = null
/* eslint-enable */

const beaconStatusSlice = createSlice({
  name: 'beaconStatus',
  initialState: {
    /** @type {BeaconStatus[]} */
    beaconStatuses: [],
    /** @type {BeaconStatusWithDetails || null} */
    openedBeaconStatusInKanban: null,
    /** @type {VesselBeaconMalfunctionsResumeAndHistory || null} */
    vesselBeaconMalfunctionsResumeAndHistory: null,
    /** @type {BeaconStatusWithDetails || null} */
    openedBeaconMalfunction: null,
    /** @type {Date} */
    vesselBeaconMalfunctionsFromDate: new Date(new Date().getUTCFullYear() - 3, 0, 1),
    loadingVesselBeaconMalfunctions: false,
    beaconMalfunctionsTab: BeaconMalfunctionsTab.RESUME
  },
  reducers: {
    /**
     * Set window statuses showed in the side window kanban
     * @function setBeaconStatuses
     * @memberOf BeaconStatusReducer
     * @param {Object=} state
     * @param {{payload: BeaconStatus[]}} action - the beacon statuses
     */
    setBeaconStatuses (state, action) {
      state.beaconStatuses = action.payload
    },
    /**
     * Update a single beacon status in the kanban
     * @function updateLocalBeaconStatuses
     * @memberOf BeaconStatusReducer
     * @param {Object=} state
     * @param {{payload: BeaconStatus}} action - the beacon status to update
     */
    updateLocalBeaconStatuses (state, action) {
      const id = action.payload?.id
      const nextBeaconStatuses = state.beaconStatuses.filter(beaconStatus => beaconStatus.id !== id)

      state.beaconStatuses = [
        action.payload,
        ...nextBeaconStatuses
      ]
    },
    /**
     * Open a beacon status in the side window kanban
     * @function setOpenedBeaconStatusInKanban
     * @memberOf BeaconStatusReducer
     * @param {Object=} state
     * @param {{payload: BeaconStatusWithDetails}} action - the beacon status to open
     */
    setOpenedBeaconStatusInKanban (state, action) {
      state.openedBeaconStatusInKanban = action.payload
    },
    /**
     * Close a single beacon status in the side window kanban
     * @function closeBeaconStatusInKanban
     * @memberOf BeaconStatusReducer
     * @param {Object=} state
     */
    closeBeaconStatusInKanban (state) {
      state.openedBeaconStatusInKanban = null
    },
    /**
     * Set selected vessel beacon malfunctions resume and history
     * @function setVesselBeaconMalfunctionsResumeAndHistory
     * @memberOf BeaconStatusReducer
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
     * @memberOf BeaconStatusReducer
     * @param {Object=} state
     * @param {{payload: Date}} action - The "from" date
     */
    setVesselBeaconMalfunctionsFromDate (state, action) {
      state.vesselBeaconMalfunctionsFromDate = action.payload
    },
    /**
     * Set the loading of beacon malfunctions to true, and shows a loader in the ERS/VMS tab
     * @function loadVesselBeaconMalfunctions
     * @memberOf BeaconStatusReducer
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
     * @memberOf BeaconStatusReducer
     * @param {Object=} state
     * @param {{payload: number}} action - The tab
     */
    setBeaconMalfunctionsTab (state, action) {
      state.beaconMalfunctionsTab = action.payload
    },
    /**
     * Open a beacon malfunction
     * @function setOpenedBeaconMalfunction
     * @memberOf BeaconStatusReducer
     * @param {Object=} state
     * @param {{payload: BeaconStatusWithDetails}} action - the beacon malfunction to open
     */
    setOpenedBeaconMalfunction (state, action) {
      state.openedBeaconMalfunction = action.payload
      state.beaconMalfunctionsTab = BeaconMalfunctionsTab.DETAIL
    }
  }
})

export const {
  setBeaconStatuses,
  updateLocalBeaconStatuses,
  setOpenedBeaconStatusInKanban,
  closeBeaconStatusInKanban,
  setVesselBeaconMalfunctionsResumeAndHistory,
  setVesselBeaconMalfunctionsFromDate,
  loadVesselBeaconMalfunctions,
  setBeaconMalfunctionsTab,
  setOpenedBeaconMalfunction
} = beaconStatusSlice.actions

export default beaconStatusSlice.reducer
