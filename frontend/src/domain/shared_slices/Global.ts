import { createSlice } from '@reduxjs/toolkit'

import { getLocalStorageState } from '../../utils'
import { UserType } from '../entities/beaconMalfunction/constants'
import { getOnlyVesselIdentityProperties, vesselsAreEquals } from '../entities/vessel/vessel'

import type { SideWindowMenuKey } from '../../features/SideWindow/constants'
import type { MapToolType } from '../entities/map'
import type { PayloadAction } from '@reduxjs/toolkit'

const userTypeLocalStorageKey = 'userType'
const lastSearchedVesselsLocalStorageKey = 'lastSearchedVessels'

// TODO Properly type this redux state.
export type GlobalState = {
  blockVesselsUpdate: boolean
  error: any
  // TODO Rename this prop.
  healthcheckTextWarning: string | undefined
  isAdmin: boolean
  isBackoffice: boolean
  isUpdatingVessels: boolean
  lastSearchedVessels: any[]
  leftBoxOpened: any
  mapToolOpened: MapToolType | undefined
  // TODO Make that an enum.
  openedSideWindowTab: SideWindowMenuKey | undefined
  // TODO Rename this prop.
  // TODO Investigate that. Should be a defined boolean.
  previewFilteredVesselsMode: boolean | undefined
  rightMenuIsOpen: boolean
  userType: string
  vesselListModalIsOpen: boolean
}
const INITIAL_STATE: GlobalState = {
  blockVesselsUpdate: false,
  error: null,
  healthcheckTextWarning: undefined,
  isAdmin: false,
  isBackoffice: false,
  isUpdatingVessels: false,
  lastSearchedVessels: getLocalStorageState([], lastSearchedVesselsLocalStorageKey),
  leftBoxOpened: null,
  mapToolOpened: undefined,
  openedSideWindowTab: undefined,
  previewFilteredVesselsMode: undefined,
  rightMenuIsOpen: false,
  userType: getLocalStorageState(UserType.SIP, userTypeLocalStorageKey),
  vesselListModalIsOpen: false
}

// TODO Properly type this redux reducers.
export const globalSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'global',
  reducers: {
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
        searchedVessel => !vesselsAreEquals(searchedVessel, vesselIdentityToAdd)
      )

      // Add vessel in the beginning
      state.lastSearchedVessels.splice(0, 0, vesselIdentityToAdd)

      // Truncate list if more than 10 items
      if (state.lastSearchedVessels.length > 10) {
        state.lastSearchedVessels.pop()
      }

      window.localStorage.setItem(lastSearchedVesselsLocalStorageKey, JSON.stringify(state.lastSearchedVessels))
    },

    /**
     * Close side window
     * @function closeSideWindow
     * @param {Object=} state
     */
    closeSideWindow(state) {
      state.openedSideWindowTab = undefined
    },

    closeVesselListModal(state) {
      state.vesselListModalIsOpen = false
    },

    contractRightMenu(state) {
      state.rightMenuIsOpen = false
    },

    expandRightMenu(state) {
      state.rightMenuIsOpen = true
    },

    /**
     * Open a side window tab
     */
    openSideWindowTab(state, action: PayloadAction<SideWindowMenuKey>) {
      state.openedSideWindowTab = action.payload
    },

    openVesselListModal(state) {
      state.vesselListModalIsOpen = true
      state.mapToolOpened = undefined
    },

    removeError(state) {
      state.error = null
    },

    resetIsUpdatingVessels(state) {
      state.isUpdatingVessels = false
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

    setError(state, action: PayloadAction<any>) {
      // eslint-disable-next-line no-console
      console.error(action.payload)

      // eslint-disable-next-line no-null/no-null
      state.error = action.payload !== undefined && action.payload !== null ? String(action.payload) : action.payload
    },

    /**
     * Set warning to show on application header
     */
    setHealthcheckTextWarning(state, action: PayloadAction<string | undefined>) {
      state.healthcheckTextWarning = action.payload
    },

    /**
     * Set the user role as admin or normal user
     */
    setIsAdmin(state, action: PayloadAction<boolean>) {
      state.isAdmin = action.payload
    },

    /**
     * Set if in backoffice or not - If true, the local geoserver is used
     */
    setIsBackoffice(state, action: PayloadAction<boolean>) {
      state.isBackoffice = action.payload
    },

    setIsUpdatingVessels(state) {
      state.isUpdatingVessels = true
    },

    /**
     * Set the left box opened as LeftBoxOpened, so the other boxes can close
     */
    setLeftBoxOpened(state, action: PayloadAction<any>) {
      state.leftBoxOpened = action.payload
    },

    /**
     * Set the map tool opened
     */
    setMapToolOpened(state, action: PayloadAction<MapToolType | undefined>) {
      state.mapToolOpened = action.payload
    },

    /**
     * Set the preview mode of the application - Hide the map tooling if the preview mode
     * (`previewFilteredVesselsMode`) is true
     */
    setPreviewFilteredVesselsMode(state, action: PayloadAction<boolean>) {
      state.previewFilteredVesselsMode = action.payload
      state.blockVesselsUpdate = action.payload
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
    }
  }
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
  setBlockVesselsUpdate,
  setError,
  setHealthcheckTextWarning,
  setIsAdmin,
  setIsBackoffice,
  setIsUpdatingVessels,
  setLeftBoxOpened,
  setMapToolOpened,
  setPreviewFilteredVesselsMode,
  setUserType
} = globalSlice.actions

export const globalSliceReducer = globalSlice.reducer
