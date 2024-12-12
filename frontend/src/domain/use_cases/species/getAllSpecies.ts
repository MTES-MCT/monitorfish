import { getAllSpeciesFromAPI } from '../../../api/species'
import { setError } from '../../shared_slices/Global'
import { speciesActions } from '../../shared_slices/Species'

import type {
  BackofficeAppDispatch,
  BackofficeAppGetState,
  BackofficeAppThunk,
  MainAppDispatch,
  MainAppGetState,
  MainAppThunk
} from '@store'
import type { Specy } from 'domain/types/specy'

export function getAllSpecies<T extends MainAppThunk | BackofficeAppThunk>(): T
export function getAllSpecies(): MainAppThunk | BackofficeAppThunk {
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

      const speciesByCode = species.reduce<Record<string, Specy>>(
        (map, specy) => ({
          ...map,
          [specy.code]: specy
        }),
        {}
      )

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
