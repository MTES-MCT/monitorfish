import { getAllGearCodesFromAPI } from '../../api/fetch'
import { setCategoriesToGears, setGears } from '../shared_slices/Gear'
import { setIsReadyToShowRegulatoryZones } from '../shared_slices/Regulatory'
import { setError } from '../shared_slices/Global'
import { batch } from 'react-redux'

const getAllGearCodes = () => dispatch => {
  getAllGearCodesFromAPI().then(gears => {
    batch(() => {
      dispatch(setGears(gears))
      dispatch(setIsReadyToShowRegulatoryZones())
    })

    const categories = [...new Set(gears.map(gear => gear.category))]
    const categoriesToGears = {}
    categories.forEach(category => {
      categoriesToGears[category] = gears.filter(gear => gear.category === category)
    })
    dispatch(setCategoriesToGears(categoriesToGears))
  }).catch(error => {
    dispatch(setError(error))
  })
}

export default getAllGearCodes
