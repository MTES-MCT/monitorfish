import { getAllGearCodesFromAPI } from '../../api/fetch'
import { setCategoriesToGears, setGears, setGroupsToCategories, setGearsByCode } from '../shared_slices/Gear'
import { setIsReadyToShowRegulatoryZones } from '../shared_slices/Regulatory'
import { setError } from '../shared_slices/Global'
import { batch } from 'react-redux'

const getAllGearCodes = () => dispatch => {
  getAllGearCodesFromAPI().then(gears => {
    /** @type {Map<string, Gear[]>} */
    const categoriesToGears = {}
    /** @type {Map<string, string>} */
    const groupToCategories = {}
    /** @type {Map<string, Gear>} */
    const gearsByCode = {}

    gears.forEach(gear => {
      const {
        code,
        category,
        groupId
      } = gear
      gearsByCode[code] = gear

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
    batch(() => {
      dispatch(setGears(gears))
      dispatch(setIsReadyToShowRegulatoryZones())
      dispatch(setCategoriesToGears(categoriesToGears))
      dispatch(setGroupsToCategories(groupToCategories))
      dispatch(setGearsByCode(gearsByCode))
    })
  }).catch(error => {
    dispatch(setError(error))
  })
}

export default getAllGearCodes
