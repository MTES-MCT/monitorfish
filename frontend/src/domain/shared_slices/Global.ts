import { createSlice } from '@reduxjs/toolkit'

import { getLocalStorageState } from '../../utils'
import { UserType } from '../entities/beaconMalfunction/constants'
import { getOnlyVesselIdentityProperties, vesselsAreEquals } from '../entities/vessel/vessel'

import type { MapBox } from '@features/Map/constants'
import type { PayloadAction } from '@reduxjs/toolkit'

const userTypeLocalStorageKey = 'userType'
const lastSearchedVesselsLocalStorageKey = 'lastSearchedVessels'

// TODO Properly type this redux state.
export type GlobalState = {
  blockVesselsUpdate: boolean
  error: any
  // TODO Rename this prop.
  healthcheckTextWarning: string[]
  isBackoffice: boolean
  isUpdatingVessels: boolean
  /** @deprecated Can be replaced by a non-Redux function once `@features/VesselSearch` is replaced with `@features/Vessel/components/VesselSearch`. */
  lastSearchedVessels: any[]
  leftMapBoxOpened: MapBox | undefined
  // TODO Rename this prop.
  // TODO Investigate that. Should be a defined boolean.
  previewFilteredVesselsMode: boolean | undefined
  rightMapBoxOpened: MapBox | undefined
  rightMenuIsOpen: boolean
  userType: string
  vesselListModalIsOpen: boolean
}
const INITIAL_STATE: GlobalState = {
  blockVesselsUpdate: false,
  error: null,
  healthcheckTextWarning: [],
  isBackoffice: false,
  isUpdatingVessels: false,
  lastSearchedVessels: getLocalStorageState([], lastSearchedVesselsLocalStorageKey),
  leftMapBoxOpened: undefined,
  previewFilteredVesselsMode: undefined,
  rightMapBoxOpened: undefined,
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
     *
     * @deprecated Can be replaced by a non-Redux function once `@features/VesselSearch` is replaced with `@features/Vessel/components/VesselSearch`.
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

    contractRightMenu(state) {
      state.rightMenuIsOpen = false
    },

    expandRightMenu(state) {
      state.rightMenuIsOpen = true
    },

    openVesselListModal(state) {
      state.vesselListModalIsOpen = true
      state.rightMapBoxOpened = undefined
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
    setHealthcheckTextWarning(state, action: PayloadAction<string[]>) {
      state.healthcheckTextWarning = action.payload
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
     * Set the left box, so the other boxes can close
     */
    setLeftMapBoxOpened(state, action: PayloadAction<MapBox | undefined>) {
      state.leftMapBoxOpened = action.payload
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
     * Set the right map box
     */
    setRightMapBoxOpened(state, action: PayloadAction<MapBox | undefined>) {
      state.rightMapBoxOpened = action.payload
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

export const globalActions = globalSlice.actions
export const globalSliceReducer = globalSlice.reducer

export const {
  addSearchedVessel,
  contractRightMenu,
  expandRightMenu,
  removeError,
  resetIsUpdatingVessels,
  setBlockVesselsUpdate,
  setError,
  setHealthcheckTextWarning,
  setIsBackoffice,
  setIsUpdatingVessels,
  setLeftMapBoxOpened,
  setPreviewFilteredVesselsMode,
  setRightMapBoxOpened,
  setUserType
} = globalSlice.actions
