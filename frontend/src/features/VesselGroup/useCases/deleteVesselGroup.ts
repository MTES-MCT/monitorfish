import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { vesselGroupApi } from '@features/VesselGroup/apis'
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

      dispatch(
        addMainWindowBanner({
          children: 'Le groupe de navires a bien été supprimé.',
          closingDelay: 3000,
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
