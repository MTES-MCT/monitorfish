import { MapBox } from '@features/Map/constants'
import { setMeasurementTypeToAdd } from '@features/Measurement/slice'
import { globalActions } from 'domain/shared_slices/Global'

export const setLeftMapBoxDisplayed = (leftMapBoxOpened: MapBox | undefined) => (dispatch, getState) => {
  const previousLeftMapBoxOpened = getState().global.leftMapBoxOpened

  if (previousLeftMapBoxOpened === MapBox.MEASUREMENT && leftMapBoxOpened !== MapBox.MEASUREMENT) {
    dispatch(setMeasurementTypeToAdd(null))
  }

  dispatch(globalActions.setLeftMapBoxOpened(leftMapBoxOpened))
}
