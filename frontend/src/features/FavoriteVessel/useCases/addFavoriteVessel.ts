import { favoriteVesselsApi } from '@features/FavoriteVessel/apis'
import { getFavoriteVesselFromVesselIdentity } from '@features/FavoriteVessel/utils'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { extractVesselIdentityProps } from '@features/Vessel/utils'
import { Level } from '@mtes-mct/monitor-ui'

import type { MainAppThunk } from '@store'

export const addFavoriteVessel =
  (vessel: Parameters<typeof extractVesselIdentityProps>[0]): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      await dispatch(
        favoriteVesselsApi.endpoints.saveFavoriteVessel.initiate(
          getFavoriteVesselFromVesselIdentity(extractVesselIdentityProps(vessel))
        )
      ).unwrap()
    } catch (error) {
      dispatch(
        addMainWindowBanner({
          children: (error as Error).message,
          closingDelay: 6000,
          isClosable: true,
          isFixed: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }
