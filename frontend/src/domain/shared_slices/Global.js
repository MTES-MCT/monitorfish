import { createSlice } from '@reduxjs/toolkit'

const globalSlice = createSlice({
  name: 'global',
  initialState: {
    error: null,
    isUpdatingVessels: false,
    blockVesselsUpdate: false,
    rightMenuIsOpen: false,
    vesselListModalIsOpen: false,
    /** @type {string | null} healthcheckTextWarning */
    healthcheckTextWarning: null,
    previewFilteredVesselsMode: undefined,
    inBackofficeMode: false
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
  setInBackofficeMode
} = globalSlice.actions

export default globalSlice.reducer
