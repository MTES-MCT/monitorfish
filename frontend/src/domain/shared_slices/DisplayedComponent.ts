import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type OptionalDisplayedComponentAction = {
  isDrawLayerModalDisplayed?: boolean
  isInterestPointMapButtonDisplayed?: boolean
  isMeasurementMapButtonDisplayed?: boolean
  isVesselFiltersMapButtonDisplayed?: boolean
  isVesselLabelsMapButtonDisplayed?: boolean
  isVesselListDisplayed?: boolean
  isVesselSearchDisplayed?: boolean
  isVesselVisibilityMapButtonDisplayed?: boolean
}

export type DisplayedComponentState = {
  isDrawLayerModalDisplayed: boolean
  isInterestPointMapButtonDisplayed: boolean
  isMeasurementMapButtonDisplayed: boolean
  isVesselFiltersMapButtonDisplayed: boolean
  isVesselLabelsMapButtonDisplayed: boolean
  isVesselListDisplayed: boolean
  isVesselSearchDisplayed: boolean
  isVesselVisibilityMapButtonDisplayed: boolean
}
const INITIAL_STATE: DisplayedComponentState = {
  isDrawLayerModalDisplayed: false,
  isInterestPointMapButtonDisplayed: true,
  isMeasurementMapButtonDisplayed: true,
  isVesselFiltersMapButtonDisplayed: true,
  isVesselLabelsMapButtonDisplayed: true,
  isVesselListDisplayed: true,
  isVesselSearchDisplayed: true,
  isVesselVisibilityMapButtonDisplayed: true
}

const displayedComponentSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'displayedComponent',
  reducers: {
    setDisplayedComponents(state, action: PayloadAction<OptionalDisplayedComponentAction>) {
      state.isDrawLayerModalDisplayed = getValueOrDefault(
        action.payload.isDrawLayerModalDisplayed,
        state.isDrawLayerModalDisplayed
      )
      state.isVesselSearchDisplayed = getValueOrDefault(
        action.payload.isVesselSearchDisplayed,
        state.isVesselSearchDisplayed
      )
      state.isVesselFiltersMapButtonDisplayed = getValueOrDefault(
        action.payload.isVesselFiltersMapButtonDisplayed,
        state.isVesselFiltersMapButtonDisplayed
      )
      state.isVesselVisibilityMapButtonDisplayed = getValueOrDefault(
        action.payload.isVesselVisibilityMapButtonDisplayed,
        state.isVesselVisibilityMapButtonDisplayed
      )
      state.isMeasurementMapButtonDisplayed = getValueOrDefault(
        action.payload.isMeasurementMapButtonDisplayed,
        state.isMeasurementMapButtonDisplayed
      )
      state.isVesselLabelsMapButtonDisplayed = getValueOrDefault(
        action.payload.isVesselLabelsMapButtonDisplayed,
        state.isVesselLabelsMapButtonDisplayed
      )
      state.isInterestPointMapButtonDisplayed = getValueOrDefault(
        action.payload.isInterestPointMapButtonDisplayed,
        state.isInterestPointMapButtonDisplayed
      )
      state.isVesselListDisplayed = getValueOrDefault(action.payload.isVesselListDisplayed, state.isVesselListDisplayed)
    }
  }
})

export const { setDisplayedComponents } = displayedComponentSlice.actions

export const displayedComponentReducer = displayedComponentSlice.reducer

function getValueOrDefault(value, defaultValue) {
  if (value !== undefined) {
    return value
  }

  return defaultValue
}
