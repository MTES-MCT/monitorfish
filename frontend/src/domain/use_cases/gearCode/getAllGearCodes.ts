import { gearApi } from '@api/gear'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import { REGULATED_GEARS_KEYS } from '../../entities/backoffice'
import { gearActions } from '../../shared_slices/Gear'

import type {
  BackofficeAppDispatch,
  BackofficeAppGetState,
  BackofficeAppPromiseThunk,
  MainAppDispatch,
  MainAppGetState,
  MainAppAsyncThunk
} from '@store'
import type { Gear } from 'domain/types/Gear'

/** *
 * Get gear group name, see SQL init of table fishing_gear_groups:
 *
 * INSERT INTO public.fishing_gear_groups VALUES
 * (1, 'Engins traînants'),
 * (2, 'Engins dormants');
 */
const GEAR_CODES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les codes des engins de pêches"

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

export function getAllGearCodes<T extends MainAppAsyncThunk | BackofficeAppPromiseThunk>(): T
export function getAllGearCodes(): MainAppAsyncThunk | BackofficeAppPromiseThunk {
  return async (
    dispatch: BackofficeAppDispatch | MainAppDispatch,
    getState: BackofficeAppGetState | MainAppGetState
  ) => {
    if (getState().gear.gears?.length) {
      return
    }

    try {
      // Shares the RTK cache (and in-flight request) with the components using `useGetGearsQuery()`
      const gears = await (dispatch as MainAppDispatch)(
        gearApi.endpoints.getGears.initiate(undefined, { subscribe: false })
      ).unwrap()
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
          [...gears].sort((a, b) => {
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
    } catch {
      /* TODO: understand type error if no `as any` */
      dispatch(
        addMainWindowBanner({
          children: GEAR_CODES_ERROR_MESSAGE,
          closingDelay: 6000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        }) as any
      )
    }
  }
}
