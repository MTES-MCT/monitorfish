import {getAllGearCodesFromAPI} from "../api/fetch";
import {setCategoriesToGears, setGears} from "../reducers/Gear";
import {setIsReadyToShowRegulatoryZones} from "../reducers/Layer";

const getAllGearCodes = () => dispatch => {
    getAllGearCodesFromAPI().then(gears => {
        dispatch(setGears(gears))
        dispatch(setIsReadyToShowRegulatoryZones())

        let categories = [...new Set(gears.map(gear => gear.category))]
        let categoriesToGears = {}
        categories.map(category => {
            categoriesToGears[category] = gears.filter(gear => gear.category === category)
        })
        dispatch(setCategoriesToGears(categoriesToGears))
    })
}

export default getAllGearCodes
