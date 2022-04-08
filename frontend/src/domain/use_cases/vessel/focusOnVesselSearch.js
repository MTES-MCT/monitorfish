import { setFocusOnVesselSearch } from '../../shared_slices/Vessel'

export const focusState = {
  CLICK_VESSEL_SEARCH_RESULT: 'CLICK_VESSEL_SEARCH_RESULT',
  CLICK_VESSEL_TITLE: 'CLICK_VESSEL_TITLE',
  CLICK_SEARCH_ICON: 'CLICK_SEARCH_ICON'
}

const focusOnVesselSearch = (state, doNotFocus) => (dispatch, getState) => {
  const currentFocus = getState()?.vessel.isFocusedOnVesselSearch
  if (doNotFocus) {
    return
  }

  switch (state) {
    case focusState.CLICK_VESSEL_TITLE:
    case focusState.CLICK_SEARCH_ICON: {
      !currentFocus && dispatch(setFocusOnVesselSearch(true))
      return
    }
    case focusState.CLICK_VESSEL_SEARCH_RESULT:
    default: {
      currentFocus && dispatch(setFocusOnVesselSearch(false))
    }
  }
}

export default focusOnVesselSearch
