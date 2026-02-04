import { MapBox } from '@features/Map/constants'
import { setMeasurementTypeToAdd } from '@features/Measurement/slice'
import { unselectVessel } from '@features/Vessel/useCases/unselectVessel'
import { globalActions } from 'domain/shared_slices/Global'

import { displayedComponentActions } from '../shared_slices/DisplayedComponent'

export const setRightMapBoxDisplayed = (rightMapBoxOpened: MapBox | undefined) => (dispatch, getState) => {
  const previousRightMapBoxOpened = getState().global.rightMapBoxOpened
  const isVesselSidebarOpen = getState().vessel.vesselSidebarIsOpen
  const { isControlUnitListDialogDisplayed } = getState().displayedComponent

  if (isVesselSidebarOpen && !!rightMapBoxOpened) {
    dispatch(unselectVessel())
  }

  if (isControlUnitListDialogDisplayed) {
    dispatch(displayedComponentActions.setDisplayedComponents({ isControlUnitListDialogDisplayed: false }))
  }

  if (previousRightMapBoxOpened === MapBox.MEASUREMENT && rightMapBoxOpened !== MapBox.MEASUREMENT) {
    dispatch(setMeasurementTypeToAdd(null))
  }

  dispatch(globalActions.setRightMapBoxOpened(rightMapBoxOpened))
}
