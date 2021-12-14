import { getAllGearCodesFromAPI } from '../../api/fetch'
import { setCategoriesToGears, setGears, setGroupsToCategories } from '../shared_slices/Gear'
import { setIsReadyToShowRegulatoryZones } from '../shared_slices/Regulatory'
import { setError } from '../shared_slices/Global'
import { batch } from 'react-redux'

const getAllGearCodes = () => dispatch => {
  getAllGearCodesFromAPI().then(gears => {
    batch(() => {
      dispatch(setGears(gears))
      dispatch(setIsReadyToShowRegulatoryZones())
    })

    const categoriesToGears = {}
    const groupToCategories = {}
    gears.forEach(gear => {
      const {
        category,
        groupId
      } = gear
      if (!Object.keys(categoriesToGears).includes(category)) {
        categoriesToGears[category] = [gear]
      } else {
        categoriesToGears[category].push(gear)
      }
      if (!Object.keys(groupToCategories).includes(`${groupId}`)) {
        groupToCategories[groupId] = [category]
      } else {
        if (!groupToCategories[groupId].includes(category)) {
          groupToCategories[groupId].push(category)
        }
      }
    })
    dispatch(setCategoriesToGears(categoriesToGears))
    dispatch(setGroupsToCategories(groupToCategories))
  }).catch(error => {
    dispatch(setError(error))
  })
}

export default getAllGearCodes
