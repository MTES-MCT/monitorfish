import { WindowContext } from '@api/constants'
import { addBackOfficeBanner } from '@features/BackOffice/useCases/addBackOfficeBanner'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import { getAllSpeciesFromAPI } from '../../../api/species'
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

export function getAllSpecies<T extends MainAppAsyncThunk | BackofficeAppPromiseThunk>(context: WindowContext): T
export function getAllSpecies(context: WindowContext): MainAppAsyncThunk | BackofficeAppPromiseThunk {
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
      const bannerProps = {
        children: (err as Error).message,
        closingDelay: 3000,
        isClosable: true,
        level: Level.ERROR,
        withAutomaticClosing: true
      }
      /* TODO: understand type error if no `as any` */
      if (context === WindowContext.BackOffice) {
        dispatch(addBackOfficeBanner(bannerProps) as any)
      } else {
        dispatch(addMainWindowBanner(bannerProps) as any)
      }
    }
  }
}
