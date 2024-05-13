import { createSlice } from '@reduxjs/toolkit'
import {
  type DisplayedComponentState,
  INITIAL_STATE as DISPLAYED_COMPONENT_INITIAL_STATE
} from 'domain/shared_slices/DisplayedComponent'

import { UserType } from '../../domain/entities/beaconMalfunction/constants'
import { getOnlyVesselIdentityProperties, vesselsAreEquals } from '../../domain/entities/vessel/vessel'
import { getLocalStorageState } from '../../utils'

import type { MapBox } from '../../domain/entities/map/constants'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { VesselIdentity } from 'domain/entities/vessel/types'

const userTypeLocalStorageKey = 'userType'
const lastSearchedVesselsLocalStorageKey = 'lastSearchedVessels'

export type MainWindowState = {
  blockVesselsUpdate: boolean
  error: any
  // TODO Rename this prop.
  healthcheckTextWarning: string[]
  isBackoffice: boolean
  isUpdatingVessels: boolean
  lastDisplayState: DisplayedComponentState
  lastSearchedVessels: any[]
  leftMapBoxOpened: MapBox | undefined
  openedLeftDialog:
    | {
        key: MapBox
        topPosition: number
      }
    | undefined
  // TODO Rename this prop.
  // TODO Investigate that. Should be a defined boolean.
  previewFilteredVesselsMode: boolean | undefined
  rightMapBoxOpened: MapBox | undefined
  rightMenuIsOpen: boolean
  userType: string
  vesselListModalIsOpen: boolean
}
const INITIAL_STATE: MainWindowState = {
  blockVesselsUpdate: false,
  error: null,
  healthcheckTextWarning: [],
  isBackoffice: false,
  isUpdatingVessels: false,
  lastDisplayState: DISPLAYED_COMPONENT_INITIAL_STATE,
  lastSearchedVessels: getLocalStorageState([], lastSearchedVesselsLocalStorageKey),
  leftMapBoxOpened: undefined,
  openedLeftDialog: undefined,
  previewFilteredVesselsMode: undefined,
  rightMapBoxOpened: undefined,
  rightMenuIsOpen: false,
  userType: getLocalStorageState(UserType.SIP, userTypeLocalStorageKey),
  vesselListModalIsOpen: false
}

export const mainWindowSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'global',
  reducers: {
    /**
     * Adds a vessel to the last searched vessels list showed below
     * the vessel search input on click
     */
    addSearchedVessel(state, action: PayloadAction<VesselIdentity>) {
      // TODO Is it useful since it seems we already receive a `VesselIdentity` (if typings are right)?
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
     * Close the left dialog.
     */
    closeLeftDialog(state) {
      state.openedLeftDialog = undefined
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
     */
    setBlockVesselsUpdate(state, action: PayloadAction<boolean>) {
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
     * @internal Don't use this action directly. Use `hideAllMainWindowComponentsAndSaveDisplayState` dispatcher.
     */
    setLastDisplayState(state, action: PayloadAction<DisplayedComponentState>) {
      state.lastDisplayState = action.payload
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
     */
    setUserType(state, action: PayloadAction<string>) {
      state.userType = action.payload
      window.localStorage.setItem(userTypeLocalStorageKey, JSON.stringify(state.userType))
    },

    /**
     * Toggle the left dialog.
     */
    toggleLeftDialog(
      state,
      action: PayloadAction<{
        key: MapBox
        topPosition: number
      }>
    ) {
      state.openedLeftDialog = action.payload.key === state.openedLeftDialog?.key ? undefined : action.payload
    }
  }
})

export const mainWindowActions = mainWindowSlice.actions
export const mainWindowSliceReducer = mainWindowSlice.reducer

export const {
  addSearchedVessel,
  closeVesselListModal,
  contractRightMenu,
  expandRightMenu,
  openVesselListModal,
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
} = mainWindowSlice.actions
