import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { localStorageManager } from '@libs/LocalStorageManager'
import { LocalStorageKey } from '@libs/LocalStorageManager/constants'
import { Level } from '@mtes-mct/monitor-ui'
import { isNotNullish } from '@utils/isNotNullish'

import { userLayersApi } from '../apis'
import { getDisplayedAdministrativeLayers, getDisplayedRegulatoryZoneIds, isEmptyUserLayers } from '../utils'

import type { UserLayers } from '../types'
import type { MonitorFishMap } from '@features/Map/Map.types'
import type { MainAppThunk } from '@store'

const LEGACY_LOCAL_STORAGE_KEYS = [
  LocalStorageKey.BaseLayer,
  LocalStorageKey.LayersShowedOnMap,
  LocalStorageKey.SelectedRegulatoryZoneIds
]

const getUserLayersFromLocalStorage = (): UserLayers => {
  const showedLayers = localStorageManager
    .get<Array<MonitorFishMap.ShowedLayer | null>>(LocalStorageKey.LayersShowedOnMap, [])
    .filter(isNotNullish)

  return {
    baseLayer: localStorageManager.get<string>(LocalStorageKey.BaseLayer),
    displayedAdministrativeLayers: getDisplayedAdministrativeLayers(showedLayers),
    displayedRegulatoryZoneIds: getDisplayedRegulatoryZoneIds(showedLayers),
    selectedRegulatoryZoneIds: localStorageManager
      .get<Array<number | string>>(LocalStorageKey.SelectedRegulatoryZoneIds, [])
      .map(String)
  }
}

/**
 * Fetch the user layers saved on the user profile.
 *
 * The first time the user layers are fetched empty, they are seeded from the browser local storage.
 * If the user has several browsers with saved local storages, only the first one used
 * after this migration is taken into account.
 *
 * Returns `undefined` on failure, so the caller never overrides the saved user layers with an empty state.
 */
export const loadUserLayers = (): MainAppThunk<Promise<UserLayers | undefined>> => async dispatch => {
  try {
    const userLayers = await dispatch(
      userLayersApi.endpoints.getUserLayers.initiate(undefined, { forceRefetch: true })
    ).unwrap()
    const userLayersFromLocalStorage = getUserLayersFromLocalStorage()
    if (!isEmptyUserLayers(userLayers) || isEmptyUserLayers(userLayersFromLocalStorage)) {
      return userLayers
    }

    const initializedUserLayers = await dispatch(
      userLayersApi.endpoints.initUserLayers.initiate(userLayersFromLocalStorage)
    ).unwrap()
    LEGACY_LOCAL_STORAGE_KEYS.forEach(key => localStorageManager.unset(key))

    return initializedUserLayers
  } catch (error) {
    dispatch(
      addMainWindowBanner({
        children: (error as Error).message,
        closingDelay: 6000,
        isClosable: true,
        level: Level.ERROR,
        withAutomaticClosing: true
      })
    )

    return undefined
  }
}
