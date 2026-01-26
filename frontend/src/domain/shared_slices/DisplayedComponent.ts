import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

export type DisplayedComponentState = {
  areVesselsDisplayed: boolean
  isAccountMapButtonDisplayed: boolean
  isActivityVisualizationMapButtonDisplayed: boolean
  isAlertsMapButtonDisplayed: boolean
  isBeaconMalfunctionsMapButtonDisplayed: boolean
  isControlUnitDialogDisplayed: boolean
  isControlUnitListDialogDisplayed: boolean
  isControlUnitListMapButtonDisplayed: boolean
  isDrawLayerModalDisplayed: boolean
  isFavoriteVesselsMapButtonDisplayed: boolean
  isInterestPointMapButtonDisplayed: boolean
  isMeasurementMapButtonDisplayed: boolean
  isMissionsLayerDisplayed: boolean
  isMissionsMapButtonDisplayed: boolean
  isNewFeaturesMapButtonDisplayed: boolean
  isPriorNotificationMapButtonDisplayed: boolean
  isStationLayerDisplayed: boolean
  isVesselFiltersMapButtonDisplayed: boolean
  isVesselGroupMainWindowEditionDisplayed: boolean
  isVesselGroupMapButtonDisplayed: boolean
  isVesselListMapButtonDisplayed: boolean
  isVesselSearchDisplayed: boolean
  isVesselVisibilityMapButtonDisplayed: boolean
}
const INITIAL_STATE: DisplayedComponentState = {
  areVesselsDisplayed: true,
  isAccountMapButtonDisplayed: true,
  isActivityVisualizationMapButtonDisplayed: true,
  isAlertsMapButtonDisplayed: true,
  isBeaconMalfunctionsMapButtonDisplayed: true,
  isControlUnitDialogDisplayed: false,
  isControlUnitListDialogDisplayed: false,
  isControlUnitListMapButtonDisplayed: true,
  isDrawLayerModalDisplayed: false,
  isFavoriteVesselsMapButtonDisplayed: true,
  isInterestPointMapButtonDisplayed: true,
  isMeasurementMapButtonDisplayed: true,
  isMissionsLayerDisplayed: true,
  isMissionsMapButtonDisplayed: true,
  isNewFeaturesMapButtonDisplayed: true,
  isPriorNotificationMapButtonDisplayed: true,
  isStationLayerDisplayed: false,
  isVesselFiltersMapButtonDisplayed: true,
  isVesselGroupMainWindowEditionDisplayed: false,
  isVesselGroupMapButtonDisplayed: true,
  isVesselListMapButtonDisplayed: true,
  isVesselSearchDisplayed: true,
  isVesselVisibilityMapButtonDisplayed: true
}

const displayedComponentSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'displayedComponent',
  reducers: {
    setDisplayedComponents(state, action: PayloadAction<Partial<DisplayedComponentState>>) {
      Object.keys(INITIAL_STATE).forEach(propertyKey => {
        state[propertyKey] = getValueOrDefault(action.payload[propertyKey], state[propertyKey])
      })
    }
  }
})

export const displayedComponentActions = displayedComponentSlice.actions
export const displayedComponentReducer = displayedComponentSlice.reducer

export const { setDisplayedComponents } = displayedComponentActions

function getValueOrDefault(value, defaultValue) {
  if (value !== undefined) {
    return value
  }

  return defaultValue
}
