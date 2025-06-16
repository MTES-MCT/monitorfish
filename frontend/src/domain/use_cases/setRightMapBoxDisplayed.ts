import { MapBox } from '@features/Map/constants'
import { setMeasurementTypeToAdd } from '@features/Measurement/slice'
import { globalActions } from 'domain/shared_slices/Global'

export const setRightMapBoxDisplayed = (rightMapBoxOpened: MapBox | undefined) => (dispatch, getState) => {
  const previousRightMapBoxOpened = getState().global.rightMapBoxOpened

  if (previousRightMapBoxOpened === MapBox.MEASUREMENT && rightMapBoxOpened !== MapBox.MEASUREMENT) {
    dispatch(setMeasurementTypeToAdd(null))
  }

  dispatch(globalActions.setRightMapBoxOpened(rightMapBoxOpened))
}
