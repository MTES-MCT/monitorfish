import { getAllSpeciesFromAPI } from '../../../api/species'
import { setError } from '../../shared_slices/Global'
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
      const speciesAndSpeciesGroups = await getAllSpeciesFromAPI()
      const { groups, species } = speciesAndSpeciesGroups

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
    } catch (err) {
      dispatch(setError(err))
    }
  }
}
