import { createSlice } from '@reduxjs/toolkit'

import { getLocalStorageState } from '../../utils'
import { UserType } from '../entities/beaconMalfunction'
import { getOnlyVesselIdentityProperties, vesselsAreEquals } from '../entities/vessel'

/* eslint-disable */
/** @namespace GlobalReducer */
const GlobalReducer = null
/* eslint-enable */

const userTypeLocalStorageKey = 'userType'
const lastSearchedVesselsLocalStorageKey = 'lastSearchedVessels'

const globalSlice = createSlice({
  initialState: {
    adminRole: false,
    blockVesselsUpdate: false,
    error: null,
    /** @type {string | null} healthcheckTextWarning */
    healthcheckTextWarning: null,

    inBackofficeMode: false,

    isUpdatingVessels: false,

    lastSearchedVessels: getLocalStorageState([], lastSearchedVesselsLocalStorageKey),

    leftBoxOpened: null,
    openedSideWindowTab: null,
    previewFilteredVesselsMode: undefined,
    rightMenuIsOpen: false,
    sideWindowIsOpen: false,
    userType: getLocalStorageState(UserType.SIP, userTypeLocalStorageKey),
    vesselListModalIsOpen: false,
  },
  name: 'global',
  reducers: {
    closeVesselListModal(state) {
      state.vesselListModalIsOpen = false
    },
    contractRightMenu(state) {
      state.rightMenuIsOpen = false
    },
    expandRightMenu(state) {
      state.rightMenuIsOpen = true
    },
    openVesselListModal(state) {
      state.vesselListModalIsOpen = true
    },
    removeError(state) {
      state.error = null
    },
    /**
     * Open a side window tab
     * @function openSideWindowTab
     * @memberOf GlobalReducer
     * @param {Object=} state
     * @param {{payload: string}} action - The tab to show, see `sideWindowMenu`
     */
openSideWindowTab(state, action) {
      state.openedSideWindowTab = action.payload
    },

    
    
resetIsUpdatingVessels(state) {
      state.isUpdatingVessels = false
    },

    /**
     * Set the user role as admin or normal user
     * @param {Object=} state
     * @param {{payload: boolean}} action - true if in admin role
     */
    setAdminRole(state, action) {
      state.adminRole = action.payload
    },

    
    /**
     * Close side window
     * @function closeSideWindow
     * @memberOf GlobalReducer
     * @param {Object=} state
     */
closeSideWindow(state) {
      state.openedSideWindowTab = null
      state.sideWindowIsOpen = false
    },

    
/**
     * Block or not the vessel update cron - The vessel update is blocked when the
     * vessel list table is opened or when vessels filters are previewed
     * @param {Object=} state
     * @param {{payload: boolean}} action - blocked when true
     */
setBlockVesselsUpdate(state, action) {
      state.blockVesselsUpdate = action.payload
    },

    /**
     * Adds a vessel to the last searched vessels list showed below
     * the vessel search input on click
     * @function addLastSearchedVessel
     * @memberOf GlobalReducer
     * @param {Object=} state
     * @param {{payload: VesselIdentity}} action - The last searched vessel
     */
addSearchedVessel(state, action) {
      const vesselIdentityToAdd = getOnlyVesselIdentityProperties(action.payload)

      // Remove vessel if already in the list
      state.lastSearchedVessels = state.lastSearchedVessels.filter(
        searchedVessel => !vesselsAreEquals(searchedVessel, vesselIdentityToAdd),
      )

      // Add vessel in the beginning
      state.lastSearchedVessels.splice(0, 0, vesselIdentityToAdd)

      // Truncate list if more than 10 items
      if (state.lastSearchedVessels.length > 10) {
        state.lastSearchedVessels.pop()
      }

      window.localStorage.setItem(lastSearchedVesselsLocalStorageKey, JSON.stringify(state.lastSearchedVessels))
    },

    
setIsUpdatingVessels(state) {
      state.isUpdatingVessels = true
    },

    setError(state, action) {
      state.error = action.payload
    },

    /**
     * Set warning to show on application header
     * @param {Object=} state
     * @param {{payload: string | null}} action - the warning(s) or null if no warning are found
     */
    setHealthcheckTextWarning(state, action) {
      state.healthcheckTextWarning = action.payload
    },

    /**
     * Set if in backoffice or not - If true, the local geoserver is used
     * @param {Object=} state
     * @param {{payload: boolean}} action - true if in backoffice mode
     */
    setInBackofficeMode(state, action) {
      state.inBackofficeMode = action.payload
    },

    /**
     * Set the left box opened as LeftBoxOpened, so the other boxes can close
     * @function setLeftBoxOpened
     * @memberOf GlobalReducer
     * @param {Object=} state
     * @param {{payload: string<LeftBoxOpened>}} action - the oepend box
     */
    setLeftBoxOpened(state, action) {
      state.leftBoxOpened = action.payload
    },

    /**
     * Set the preview mode of the application - Hide the map tooling if the preview mode is true
     * @param {Object=} state
     * @param {{payload: boolean}} action - in preview mode when true
     */
    setPreviewFilteredVesselsMode(state, action) {
      state.previewFilteredVesselsMode = action.payload
      state.blockVesselsUpdate = action.payload
    },

    /**
     * Set the side window as open
     * @function setSideWindowAsOpen
     * @memberOf GlobalReducer
     * @param {Object=} state
     */
    setSideWindowAsOpen(state) {
      state.sideWindowIsOpen = true
    },

    /**
     * Set the user type as OPS or SIP
     * @function setUserType
     * @memberOf GlobalReducer
     * @param {Object=} state
     * @param {{payload: string}} action - The user type
     */
    setUserType(state, action) {
      state.userType = action.payload
      window.localStorage.setItem(userTypeLocalStorageKey, JSON.stringify(state.userType))
    },
  },
})

export const {
  addSearchedVessel,
  closeSideWindow,
  closeVesselListModal,
  contractRightMenu,
  expandRightMenu,
  openSideWindowTab,
  openVesselListModal,
  removeError,
  resetIsUpdatingVessels,
  setAdminRole,
  setBlockVesselsUpdate,
  setError,
  setHealthcheckTextWarning,
  setInBackofficeMode,
  setIsUpdatingVessels,
  setLeftBoxOpened,
  setPreviewFilteredVesselsMode,
  setSideWindowAsOpen,
  setUserType,
} = globalSlice.actions

export default globalSlice.reducer
