import { favoriteVesselsApi } from '@features/FavoriteVessel/apis'
import { getFavoriteVesselFromVesselIdentity } from '@features/FavoriteVessel/utils'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { localStorageManager } from '@libs/LocalStorageManager'
import { LocalStorageKey } from '@libs/LocalStorageManager/constants'
import { Level } from '@mtes-mct/monitor-ui'

import type { Vessel } from '@features/Vessel/Vessel.types'

export const initFavoriteVessels = (vesselsFromLocalStorage: Vessel.VesselIdentity[]) => async dispatch => {
  const vessels = vesselsFromLocalStorage.map(getFavoriteVesselFromVesselIdentity)

  try {
    await dispatch(favoriteVesselsApi.endpoints.initFavoriteVessel.initiate(vessels)).unwrap()

    localStorageManager.unset(LocalStorageKey.FavoriteVessels)
  } catch (error) {
    dispatch(
      addSideWindowBanner({
        children: (error as Error).message,
        closingDelay: 6000,
        isClosable: true,
        level: Level.ERROR,
        withAutomaticClosing: true
      })
    )
  }
}
