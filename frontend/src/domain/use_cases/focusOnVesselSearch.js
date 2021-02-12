import {setFocusOnVesselSearch} from "../reducers/Vessel";

export const focusState = {
    CLICK_VESSEL_SEARCH_RESULT: "CLICK_VESSEL_SEARCH_RESULT",
    CLICK_VESSEL_TITLE: "CLICK_VESSEL_TITLE",

}

const focusOnVesselSearch = (state, isUpdatedVessel) => dispatch => {
    if(isUpdatedVessel) {
        return
    }

    switch (state) {
        case focusState.CLICK_VESSEL_TITLE: {
            dispatch(setFocusOnVesselSearch(true))
            return
        }
        case focusState.CLICK_VESSEL_SEARCH_RESULT: {
            dispatch(setFocusOnVesselSearch(false))
            return
        }
    }

    dispatch(setFocusOnVesselSearch(false))
}

export default focusOnVesselSearch
