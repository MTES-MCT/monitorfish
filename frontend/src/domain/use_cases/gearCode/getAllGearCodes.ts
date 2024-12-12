import { getAllGearsFromAPI } from '../../../api/gearCode'
import { REGULATED_GEARS_KEYS } from '../../entities/backoffice'
import { gearActions } from '../../shared_slices/Gear'
import { setError } from '../../shared_slices/Global'

import type {
  BackofficeAppDispatch,
  BackofficeAppGetState,
  BackofficeAppThunk,
  MainAppDispatch,
  MainAppGetState,
  MainAppThunk
} from '@store'
import type { Gear } from 'domain/types/Gear'

/** *
 * Get gear group name, see SQL init of table fishing_gear_groups:
 *
 * INSERT INTO public.fishing_gear_groups VALUES
 * (1, 'Engins traînants'),
 * (2, 'Engins dormants');
 */
const getGroupName = (groupId: 1 | 2): string | undefined => {
  switch (groupId) {
    case 1:
      return REGULATED_GEARS_KEYS.ALL_TOWED_GEARS
    case 2:
      return REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS
    default:
      return undefined
  }
}

export function getAllGearCodes<T extends MainAppThunk | BackofficeAppThunk>(): T
export function getAllGearCodes(): MainAppThunk | BackofficeAppThunk {
  return async (
    dispatch: BackofficeAppDispatch | MainAppDispatch,
    getState: BackofficeAppGetState | MainAppGetState
  ) => {
    if (getState().gear.gears?.length) {
      return
    }

    try {
      const gears = await getAllGearsFromAPI()
      const categoriesToGears: Record<string, Gear[]> = {}
      const groupToCategories: Partial<Record<REGULATED_GEARS_KEYS, string[]>> = {}
      const gearsByCode: Record<string, Gear> = {}

      gears.forEach(gear => {
        const { category, code, groupId } = gear
        gearsByCode[code] = gear

        if (!Object.keys(categoriesToGears).includes(category)) {
          categoriesToGears[category] = [gear]
        } else {
          categoriesToGears[category]?.push(gear)
        }

        const groupName = getGroupName(groupId)
        if (groupName) {
          if (!Object.keys(groupToCategories).includes(groupName)) {
            groupToCategories[groupName] = [category]
          } else if (!groupToCategories[groupName]?.includes(category)) {
            groupToCategories[groupName]?.push(category)
          }
        }
      })

      dispatch(
        gearActions.setGears(
          gears.sort((a, b) => {
            if (a.code && b.code) {
              return a.code.localeCompare(b.code)
            }

            return 0
          })
        )
      )
      dispatch(gearActions.setCategoriesToGears(categoriesToGears))
      dispatch(gearActions.setGroupsToCategories(groupToCategories))
      dispatch(gearActions.setGearsByCode(gearsByCode))
    } catch (err) {
      dispatch(setError(err))
    }
  }
}
