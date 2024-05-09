import { createSlice } from '@reduxjs/toolkit'

import { getLocalStorageState } from '../../utils'
import { getLocalstorageProperty } from '../../utils/getLocalstorageProperty'

import type { PayloadAction } from '@reduxjs/toolkit'

const displayedComponentsLocalstorageKey = 'displayedComponents'

// TODO Move this slice either into `MainWindow` slice, or create related feature components slices (LeftMenu, RightMenu, etc.).
export type DisplayedComponentState = {
  areVesselsDisplayed: boolean
  isAlertsLeftMenuButtonDisplayed: boolean
  isBeaconMalfunctionsLeftMenuButtonDisplayed: boolean
  isControlUnitDialogDisplayed: boolean
  isControlUnitListDialogDisplayed: boolean
  isDrawLayerModalDisplayed: boolean
  isFavoriteVesselsLeftMenuButtonDisplayed: boolean
  isInterestPointRightMenuButtonDisplayed: boolean
  isMeasurementRightMenuButtonDisplayed: boolean
  isMissionsLayerDisplayed: boolean
  isMissionsLeftMenuButtonDisplayed: boolean
  isPriorNotificationLeftMenuButtonDisplayed: boolean
  isStationLayerDisplayed: boolean
  isVesselFiltersRightMenuButtonDisplayed: boolean
  isVesselLabelsRightMenuButtonDisplayed: boolean
  isVesselListDisplayed: boolean
  isVesselListModalDisplayed: boolean
  isVesselSearchDisplayed: boolean
  isVesselVisibilityRightMenuButtonDisplayed: boolean
}
const INITIAL_STATE: DisplayedComponentState = {
  areVesselsDisplayed: true,
  isAlertsLeftMenuButtonDisplayed: true,
  isBeaconMalfunctionsLeftMenuButtonDisplayed: true,
  isControlUnitDialogDisplayed: false,
  isControlUnitListDialogDisplayed: false,
  isDrawLayerModalDisplayed: false,
  isFavoriteVesselsLeftMenuButtonDisplayed: true,
  isInterestPointRightMenuButtonDisplayed: true,
  isMeasurementRightMenuButtonDisplayed: true,
  isMissionsLayerDisplayed: getLocalstorageProperty(
    true,
    displayedComponentsLocalstorageKey,
    'isMissionsLayerDisplayed'
  ),
  isMissionsLeftMenuButtonDisplayed: true,
  isPriorNotificationLeftMenuButtonDisplayed: true,
  isStationLayerDisplayed: false,
  isVesselFiltersRightMenuButtonDisplayed: true,
  isVesselLabelsRightMenuButtonDisplayed: true,
  isVesselListDisplayed: true,
  isVesselListModalDisplayed: false,
  isVesselSearchDisplayed: true,
  isVesselVisibilityRightMenuButtonDisplayed: true
}

/**
 * Components saved in local storage
 */
const savedComponents = ['isMissionsLayerDisplayed']

const displayedComponentSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'displayedComponent',
  reducers: {
    setDisplayedComponents(state, action: PayloadAction<Partial<DisplayedComponentState>>) {
      Object.keys(INITIAL_STATE).forEach(propertyKey => {
        const value = getValueOrDefault(action.payload[propertyKey], state[propertyKey])

        state[propertyKey] = value

        // If the displayed component has to be saved in local storage
        if (savedComponents.includes(propertyKey)) {
          const localstorageState = getLocalStorageState({}, displayedComponentsLocalstorageKey)
          localstorageState[propertyKey] = value

          window.localStorage.setItem(displayedComponentsLocalstorageKey, JSON.stringify(localstorageState))
        }
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
