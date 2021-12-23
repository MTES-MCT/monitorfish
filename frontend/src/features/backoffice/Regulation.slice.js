import { createSlice } from '@reduxjs/toolkit'

const INITIAL_STATE = {
  /** @type {RegulatoryText} */
  selectedRegulation: undefined,
  /** @type {UpcomingRegulation} */
  upcomingRegulation: undefined,
  /** @type {boolean} */
  isModalOpen: false,
  /** @type {Map<number, RegulatoryText | null>} */
  upcomingRegulatoryTextCheckedMap: undefined,
  /** @type {Map<number, RegulatoryText | null>} */
  regulatoryTextCheckedMap: undefined,
  /** @type {boolean} */
  saveOrUpdateRegulation: false,
  /** @type {boolean} */
  saveUpcomingRegulation: false,
  /** @type {boolean} */
  regulationSaved: false,
  /** @type {boolean} */
  regulationDeleted: false,
  /** @type {boolean} */
  atLeastOneValueIsMissing: undefined,
  /** @type {boolean} */
  isRemoveModalOpen: false,
  /** @type {boolean} */
  isConfirmModalOpen: false,
  /** @type {boolean} */
  selectedGeometryId: undefined
}

const regulationSlice = createSlice({
  name: 'regulation',
  initialState: INITIAL_STATE,
  reducers: {
    resetState: () => INITIAL_STATE,
    setSelectedRegulation (state, action) {
      state.selectedRegulation = action.payload
      if (action.payload) {
        window.localStorage.setItem('selectedRegulation', JSON.stringify(action.payload))
      } else {
        window.localStorage.removeItem('selectedRegulation')
      }
    },
    setIsModalOpen (state, action) {
      state.isModalOpen = action.payload
    },
    setUpcomingRegulation (state, action) {
      state.upcomingRegulation = action.payload
    },
    addObjectToRegulatoryTextCheckedMap (state, action) {
      const {
        /** @type {boolean} */
        complete,
        /** @type {number} */
        id
      } = action.payload
      state.regulatoryTextCheckedMap = {
        ...(state.regulatoryTextCheckedMap || {}),
        [id]: complete
      }
    },
    addObjectToUpcomingRegulatoryTextCheckedMap (state, action) {
      const {
        /** @type {boolean} */
        complete,
        /** @type {number} */
        id
      } = action.payload
      state.upcomingRegulatoryTextCheckedMap = {
        ...(state.upcomingRegulatoryTextCheckedMap || {}),
        [id]: complete
      }
    },
    setUpcomingRegulatoryTextListCheckedMap (state, action) {
      state.upcomingRegulatoryTextCheckedMap = action.payload
    },
    setRegulatoryTextCheckedMap (state, action) {
      state.regulatoryTextCheckedMap = { ...action.payload }
    },
    setRegulationSaved (state, action) {
      state.regulationSaved = action.payload
    },
    setSaveOrUpdateRegulation (state, action) {
      state.saveOrUpdateRegulation = action.payload
    },
    setAtLeastOneValueIsMissing (state, action) {
      state.atLeastOneValueIsMissing = action.payload
    },
    setSaveUpcomingRegulation (state, action) {
      state.saveUpcomingRegulation = action.payload
    },
    setRegulationDeleted (state, action) {
      state.regulationDeleted = action.payload
    },
    setIsRemoveModalOpen (state, action) {
      state.isRemoveModalOpen = action.payload
    },
    setIsConfirmModalOpen (state, action) {
      state.isConfirmModalOpen = action.payload
    },
    setSelectedGeometryId (state, action) {
      state.selectedGeometryId = action.payload
    }
  }
})

export const {
  resetState,
  setSelectedRegulation,
  setIsModalOpen,
  setUpcomingRegulation,
  addObjectToUpcomingRegulatoryTextCheckedMap,
  setUpcomingRegulatoryTextListCheckedMap,
  setRegulationSaved,
  setRegulatoryTextCheckedMap,
  addObjectToRegulatoryTextCheckedMap,
  setSaveOrUpdateRegulation,
  setAtLeastOneValueIsMissing,
  setSaveUpcomingRegulation,
  setRegulationDeleted,
  setIsRemoveModalOpen,
  setIsConfirmModalOpen,
  setSelectedGeometryId
} = regulationSlice.actions

export default regulationSlice.reducer
