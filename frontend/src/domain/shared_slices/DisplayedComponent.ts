import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

export type OptionalDisplayedComponentAction = {
  areVesselsDisplayed?: boolean
  isAlertsMapButtonDisplayed?: boolean
  isBeaconMalfunctionsMapButtonDisplayed?: boolean
  isDrawLayerModalDisplayed?: boolean
  isFavoriteVesselsMapButtonDisplayed?: boolean
  isInterestPointMapButtonDisplayed?: boolean
  isMeasurementMapButtonDisplayed?: boolean
  isMissionsLayerDisplayed?: boolean
  isMissionsMapButtonDisplayed?: boolean
  isVesselFiltersMapButtonDisplayed?: boolean
  isVesselLabelsMapButtonDisplayed?: boolean
  isVesselListDisplayed?: boolean
  isVesselListModalDisplayed?: boolean
  isVesselSearchDisplayed?: boolean
  isVesselVisibilityMapButtonDisplayed?: boolean
}

export type DisplayedComponentState = {
  areVesselsDisplayed: boolean
  isAlertsMapButtonDisplayed: boolean
  isBeaconMalfunctionsMapButtonDisplayed: boolean
  isDrawLayerModalDisplayed: boolean
  isFavoriteVesselsMapButtonDisplayed: boolean
  isInterestPointMapButtonDisplayed: boolean
  isMeasurementMapButtonDisplayed: boolean
  isMissionsLayerDisplayed: boolean
  isMissionsMapButtonDisplayed: boolean
  isVesselFiltersMapButtonDisplayed: boolean
  isVesselLabelsMapButtonDisplayed: boolean
  isVesselListDisplayed: boolean
  isVesselListModalDisplayed: boolean
  isVesselSearchDisplayed: boolean
  isVesselVisibilityMapButtonDisplayed: boolean
}
const INITIAL_STATE: DisplayedComponentState = {
  areVesselsDisplayed: true,
  isAlertsMapButtonDisplayed: true,
  isBeaconMalfunctionsMapButtonDisplayed: true,
  isDrawLayerModalDisplayed: false,
  isFavoriteVesselsMapButtonDisplayed: true,
  isInterestPointMapButtonDisplayed: true,
  isMeasurementMapButtonDisplayed: true,
  isMissionsLayerDisplayed: false,
  isMissionsMapButtonDisplayed: true,
  isVesselFiltersMapButtonDisplayed: true,
  isVesselLabelsMapButtonDisplayed: true,
  isVesselListDisplayed: true,
  isVesselListModalDisplayed: false,
  isVesselSearchDisplayed: true,
  isVesselVisibilityMapButtonDisplayed: true
}

const displayedComponentSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'displayedComponent',
  reducers: {
    setDisplayedComponents(state, action: PayloadAction<OptionalDisplayedComponentAction>) {
      Object.keys(INITIAL_STATE).forEach(key => {
        state[key] = getValueOrDefault(action.payload[key], state[key])
      })
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
