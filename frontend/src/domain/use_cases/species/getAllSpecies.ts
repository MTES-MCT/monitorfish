import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import { specyApi } from '../../../api/specy'
import { speciesActions } from '../../shared_slices/Species'

import type {
  BackofficeAppDispatch,
  BackofficeAppGetState,
  BackofficeAppPromiseThunk,
  MainAppDispatch,
  MainAppGetState,
  MainAppAsyncThunk
} from '@store'
import type { Specy } from 'domain/types/specy'

const SPECIES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les espèces"

export function getAllSpecies<T extends MainAppAsyncThunk | BackofficeAppPromiseThunk>(): T
export function getAllSpecies(): MainAppAsyncThunk | BackofficeAppPromiseThunk {
  return async (
    dispatch: BackofficeAppDispatch | MainAppDispatch,
    getState: BackofficeAppGetState | MainAppGetState
  ) => {
    if (!!getState().species.speciesByCode?.length || !!getState().species.speciesGroups?.length) {
      return
    }

    try {
      // Shares the RTK cache (and in-flight request) with the components using `useGetSpeciesQuery()`
      const { groups, species } = await (dispatch as MainAppDispatch)(
        specyApi.endpoints.getSpecies.initiate(undefined, { subscribe: false })
      ).unwrap()

      const speciesByCode = species.reduce<Record<string, Specy>>((map, specy) => {
        // We use param reassign for performance reason
        // eslint-disable-next-line no-param-reassign
        map[specy.code] = specy

        return map
      }, {})

      dispatch(
        speciesActions.setSpeciesAndSpeciesGroups({
          groups,
          species,
          speciesByCode
        })
      )
    } catch {
      /* TODO: understand type error if no `as any` */
      dispatch(
        addMainWindowBanner({
          children: SPECIES_ERROR_MESSAGE,
          closingDelay: 6000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        }) as any
      )
    }
  }
}
