import { setCategoriesToGears, setGears, setGroupsToCategories, setGearsByCode } from '../../shared_slices/Gear'
import { setIsReadyToShowRegulatoryZones } from '../../shared_slices/Regulatory'
import { setError } from '../../shared_slices/Global'
import { batch } from 'react-redux'
import { getAllGearCodesFromAPI } from '../../../api/gearCode'
import { REGULATED_GEARS_KEYS } from '../../entities/backoffice'

/***
 * Get gear group name, see SQL init of table fishing_gear_groups:
 *
 * INSERT INTO public.fishing_gear_groups VALUES
 * (1, 'Engins traînants'),
 * (2, 'Engins dormants');
 *
 * @param groupId
 * @return {string|null}
 */
const getGroupName = groupId => {
  switch (groupId) {
    case 1: return REGULATED_GEARS_KEYS.ALL_TOWED_GEARS
    case 2: return REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS
    default: return null
  }
}

const getAllGearCodes = () => (dispatch, getState) => {
  if (getState().gear.gears?.length) {
    return
  }

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

      const groupName = getGroupName(groupId)
      if (!Object.keys(groupToCategories).includes(groupName)) {
        groupToCategories[groupName] = [category]
      } else {
        if (!groupToCategories[groupName].includes(category)) {
          groupToCategories[groupName].push(category)
        }
      }
    })
    batch(() => {
      dispatch(setGears(gears.sort((a, b) => {
        if (a.code && b.code) {
          return a.code.localeCompare(b.code)
        }

        return null
      })))
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
