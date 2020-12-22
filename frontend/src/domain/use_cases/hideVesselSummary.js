import {closeVesselSummary} from "../reducers/Vessel";

const hideVesselSummary = () => dispatch => {
    dispatch(closeVesselSummary())
}

export default hideVesselSummary