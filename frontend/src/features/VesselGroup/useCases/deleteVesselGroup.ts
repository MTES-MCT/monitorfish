import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { showVesselsLastPosition } from '@features/Vessel/useCases/showVesselsLastPosition'
import { Vessel } from '@features/Vessel/Vessel.types'
import { vesselApi } from '@features/Vessel/vesselApi'
import { vesselGroupApi } from '@features/VesselGroup/apis'
import { vesselGroupActions } from '@features/VesselGroup/slice'
import { trackEvent } from '@hooks/useTracking'
import { Level } from '@mtes-mct/monitor-ui'

import type { MainAppThunk } from '@store'

export const deleteVesselGroup =
  (vesselGroupId: number): MainAppThunk =>
  async dispatch => {
    trackEvent({
      action: "Suppression d'un groupe de navires",
      category: 'VESSEL_GROUP',
      name: vesselGroupId.toString()
    })

    try {
      await dispatch(vesselGroupApi.endpoints.deleteVesselGroup.initiate(vesselGroupId)).unwrap()
      await dispatch(vesselGroupActions.vesselGroupIdHidden(vesselGroupId))

      const vessels = await dispatch(
        vesselApi.endpoints.getVesselsLastPositions.initiate(undefined, RTK_FORCE_REFETCH_QUERY_OPTIONS)
      ).unwrap()
      dispatch(showVesselsLastPosition(vessels as Vessel.VesselLastPosition[]))

      dispatch(
        addMainWindowBanner({
          children: 'Le groupe de navires a bien été supprimé.',
          closingDelay: 2000,
          isClosable: true,
          level: Level.SUCCESS,
          withAutomaticClosing: true
        })
      )
      dispatch(
        addSideWindowBanner({
          children: 'Le groupe de navires a bien été supprimé.',
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
