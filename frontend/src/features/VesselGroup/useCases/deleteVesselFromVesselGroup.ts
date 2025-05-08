import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { saveActiveVesselsAndDisplayLastPositions } from '@features/Vessel/useCases/saveActiveVesselsAndDisplayLastPositions'
import { vesselApi } from '@features/Vessel/vesselApi'
import { vesselGroupApi } from '@features/VesselGroup/apis'
import { Level } from '@mtes-mct/monitor-ui'

import type { MainAppThunk } from '@store'

export const deleteVesselFromVesselGroup =
  (vesselGroupId: number, vesselIndex: number): MainAppThunk =>
  async dispatch => {
    try {
      await dispatch(
        vesselGroupApi.endpoints.deleteVesselFromVesselGroup.initiate({
          groupId: vesselGroupId,
          vesselIndex
        })
      ).unwrap()

      const vessels = await dispatch(
        vesselApi.endpoints.getActiveVessels.initiate(undefined, RTK_FORCE_REFETCH_QUERY_OPTIONS)
      ).unwrap()
      dispatch(saveActiveVesselsAndDisplayLastPositions(vessels))

      dispatch(
        addSideWindowBanner({
          children: 'Le navire a bien été supprimé du groupe de navires.',
          closingDelay: 2000,
          isClosable: true,
          level: Level.SUCCESS,
          withAutomaticClosing: true
        })
      )
    } catch (error) {
      dispatch(
        addMainWindowBanner({
          children: (error as Error).message,
          closingDelay: 5000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }
