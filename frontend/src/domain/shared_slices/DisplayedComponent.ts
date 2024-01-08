import { createSlice } from '@reduxjs/toolkit'

import { getLocalStorageState } from '../../utils'
import { getLocalstorageProperty } from '../../utils/getLocalstorageProperty'

import type { PayloadAction } from '@reduxjs/toolkit'

const displayedComponentsLocalstorageKey = 'displayedComponents'

export type DisplayedComponentState = {
  areVesselsDisplayed: boolean
  isAlertsMapButtonDisplayed: boolean
  isBeaconMalfunctionsMapButtonDisplayed: boolean
  isControlUnitDialogDisplayed: boolean
  isControlUnitListDialogDisplayed: boolean
  isDrawLayerModalDisplayed: boolean
  isFavoriteVesselsMapButtonDisplayed: boolean
  isInterestPointMapButtonDisplayed: boolean
  isMeasurementMapButtonDisplayed: boolean
  isMissionsLayerDisplayed: boolean
  isMissionsMapButtonDisplayed: boolean
  isStationLayerDisplayed: boolean
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
  isControlUnitDialogDisplayed: false,
  isControlUnitListDialogDisplayed: false,
  isDrawLayerModalDisplayed: false,
  isFavoriteVesselsMapButtonDisplayed: true,
  isInterestPointMapButtonDisplayed: true,
  isMeasurementMapButtonDisplayed: true,
  isMissionsLayerDisplayed: getLocalstorageProperty(
    true,
    displayedComponentsLocalstorageKey,
    'isMissionsLayerDisplayed'
  ),
  isMissionsMapButtonDisplayed: true,
  isStationLayerDisplayed: true,
  isVesselFiltersMapButtonDisplayed: true,
  isVesselLabelsMapButtonDisplayed: true,
  isVesselListDisplayed: true,
  isVesselListModalDisplayed: false,
  isVesselSearchDisplayed: true,
  isVesselVisibilityMapButtonDisplayed: true
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
