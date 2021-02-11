import {getAllGearCodesFromAPI} from "../../api/fetch";
import {setCategoriesToGears, setGears} from "../reducers/Gear";
import {setIsReadyToShowRegulatoryZones} from "../reducers/Regulatory";
import {setError} from "../reducers/Global";

const getAllGearCodes = () => dispatch => {
    getAllGearCodesFromAPI().then(gears => {
        dispatch(setGears(gears))
        dispatch(setIsReadyToShowRegulatoryZones())

        let categories = [...new Set(gears.map(gear => gear.category))]
        let categoriesToGears = {}
        categories.forEach(category => {
            categoriesToGears[category] = gears.filter(gear => gear.category === category)
        })
        dispatch(setCategoriesToGears(categoriesToGears))
    }).catch(error => {
        dispatch(setError(error));
    });
}

export default getAllGearCodes
