import { createSlice } from '@reduxjs/toolkit'
import { UserType } from '../entities/beaconMalfunction'
import { getLocalStorageState } from '../../utils'
import { getOnlyVesselIdentityProperties, vesselsAreEquals } from '../entities/vessel'

/* eslint-disable */
/** @namespace GlobalReducer */
const GlobalReducer = null
/* eslint-enable */

const userTypeLocalStorageKey = 'userType'
const lastSearchedVesselsLocalStorageKey = 'lastSearchedVessels'

const globalSlice = createSlice({
  name: 'global',
  initialState: {
    adminRole: false,
    error: null,
    isUpdatingVessels: false,
    blockVesselsUpdate: false,
    rightMenuIsOpen: false,
    vesselListModalIsOpen: false,
    /** @type {string | null} healthcheckTextWarning */
    healthcheckTextWarning: null,
    previewFilteredVesselsMode: undefined,
    inBackofficeMode: false,
    openedSideWindowTab: null,
    sideWindowIsOpen: false,
    userType: getLocalStorageState(UserType.SIP, userTypeLocalStorageKey),
    lastSearchedVessels: getLocalStorageState([], lastSearchedVesselsLocalStorageKey)
  },
  reducers: {
    expandRightMenu (state) {
      state.rightMenuIsOpen = true
    },
    contractRightMenu (state) {
      state.rightMenuIsOpen = false
    },
    setIsUpdatingVessels (state) {
      state.isUpdatingVessels = true
    },
    openVesselListModal (state) {
      state.vesselListModalIsOpen = true
    },
    closeVesselListModal (state) {
      state.vesselListModalIsOpen = false
    },
    resetIsUpdatingVessels (state) {
      state.isUpdatingVessels = false
    },
    /**
     * Set the user role as admin or normal user
     * @param {Object=} state
     * @param {{payload: boolean}} action - true if in admin role
     */
    setAdminRole (state, action) {
      state.adminRole = action.payload
    },
    setError (state, action) {
      state.error = action.payload
    },
    removeError (state) {
      state.error = null
    },
    /**
     * Set warning to show on application header
     * @param {Object=} state
     * @param {{payload: string | null}} action - the warning(s) or null if no warning are found
     */
    setHealthcheckTextWarning (state, action) {
      state.healthcheckTextWarning = action.payload
    },
    /**
     * Set the preview mode of the application - Hide the map tooling if the preview mode is true
     * @param {Object=} state
     * @param {{payload: boolean}} action - in preview mode when true
     */
    setPreviewFilteredVesselsMode (state, action) {
      state.previewFilteredVesselsMode = action.payload
      state.blockVesselsUpdate = action.payload
    },
    /**
     * Block or not the vessel update cron - The vessel update is blocked when the
     * vessel list table is opened or when vessels filters are previewed
     * @param {Object=} state
     * @param {{payload: boolean}} action - blocked when true
     */
    setBlockVesselsUpdate (state, action) {
      state.blockVesselsUpdate = action.payload
    },
    /**
     * Set if in backoffice or not - If true, the local geoserver is used
     * @param {Object=} state
     * @param {{payload: boolean}} action - true if in backoffice mode
     */
    setInBackofficeMode (state, action) {
      state.inBackofficeMode = action.payload
    },
    /**
     * Open a side window tab
     * @function openSideWindowTab
     * @memberOf GlobalReducer
     * @param {Object=} state
     * @param {{payload: string}} action - The tab to show, see `sideWindowMenu`
     */
    openSideWindowTab (state, action) {
      state.openedSideWindowTab = action.payload
    },
    /**
     * Close side window
     * @function closeSideWindow
     * @memberOf GlobalReducer
     * @param {Object=} state
     */
    closeSideWindow (state) {
      state.openedSideWindowTab = null
      state.sideWindowIsOpen = false
    },
    /**
     * Set the side window as open
     * @function setSideWindowAsOpen
     * @memberOf GlobalReducer
     * @param {Object=} state
     */
    setSideWindowAsOpen (state) {
      state.sideWindowIsOpen = true
    },
    /**
     * Set the user type as OPS or SIP
     * @function setUserType
     * @memberOf GlobalReducer
     * @param {Object=} state
     * @param {{payload: string}} action - The user type
     */
    setUserType (state, action) {
      state.userType = action.payload
      window.localStorage.setItem(userTypeLocalStorageKey, JSON.stringify(state.userType))
    },
    /**
     * Adds a vessel to the last searched vessels list showed below
     * the vessel search input on click
     * @function addLastSearchedVessel
     * @memberOf GlobalReducer
     * @param {Object=} state
     * @param {{payload: VesselIdentity}} action - The last searched vessel
     */
    addSearchedVessel (state, action) {
      const vesselIdentityToAdd = getOnlyVesselIdentityProperties(action.payload)

      // Remove vessel if already in the list
      state.lastSearchedVessels = state.lastSearchedVessels.filter(searchedVessel => !vesselsAreEquals(searchedVessel, vesselIdentityToAdd))

      // Add vessel in the beginning
      state.lastSearchedVessels.splice(0, 0, vesselIdentityToAdd)

      // Truncate list if more than 10 items
      if (state.lastSearchedVessels.length > 10) {
        state.lastSearchedVessels.pop()
      }

      window.localStorage.setItem(lastSearchedVesselsLocalStorageKey, JSON.stringify(state.lastSearchedVessels))
    }
  }
})

export const {
  setError,
  removeError,
  setIsUpdatingVessels,
  resetIsUpdatingVessels,
  expandRightMenu,
  contractRightMenu,
  openVesselListModal,
  closeVesselListModal,
  setHealthcheckTextWarning,
  setPreviewFilteredVesselsMode,
  setBlockVesselsUpdate,
  setInBackofficeMode,
  openSideWindowTab,
  setSideWindowAsOpen,
  closeSideWindow,
  setUserType,
  addSearchedVessel,
  setAdminRole
} = globalSlice.actions

export default globalSlice.reducer
