import {getAllGearCodesFromAPI} from "../api/fetch";
import {setGears} from "../reducers/Gear";

const getAllGearCodes = () => dispatch => {
    getAllGearCodesFromAPI().then(gears => dispatch(setGears(gears)))
}

export default getAllGearCodes
