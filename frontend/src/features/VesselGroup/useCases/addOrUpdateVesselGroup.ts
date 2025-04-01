import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { showVesselsLastPosition } from '@features/Vessel/useCases/showVesselsLastPosition'
import { Vessel } from '@features/Vessel/Vessel.types'
import { vesselApi } from '@features/Vessel/vesselApi'
import { vesselGroupApi } from '@features/VesselGroup/apis'
import { trackEvent } from '@hooks/useTracking'
import { Level } from '@mtes-mct/monitor-ui'

import type { CreateOrUpdateDynamicVesselGroup } from '@features/VesselGroup/types'
import type { MainAppThunk } from '@store'

export const addOrUpdateVesselGroup =
  (vesselGroup: CreateOrUpdateDynamicVesselGroup): MainAppThunk<Promise<boolean>> =>
  async (dispatch): Promise<boolean> => {
    const isUpdate = !!vesselGroup.id

    trackEvent({
      action: `${isUpdate ? 'Modification' : 'Création'} d'un groupe de navires`,
      category: 'VESSEL_GROUP',
      name: vesselGroup.name
    })

    try {
      await dispatch(vesselGroupApi.endpoints.createOrUpdateDynamicVesselGroup.initiate(vesselGroup)).unwrap()

      const vessels = await dispatch(
        vesselApi.endpoints.getVesselsLastPositions.initiate(undefined, RTK_FORCE_REFETCH_QUERY_OPTIONS)
      ).unwrap()
      dispatch(showVesselsLastPosition(vessels as Vessel.VesselLastPosition[]))

      const bannerText = `Le groupe de navires dynamique "${vesselGroup.name}" a bien été ${isUpdate ? 'modifié' : 'créé'}.`
      dispatch(
        addSideWindowBanner({
          children: bannerText,
          closingDelay: 5000,
          isClosable: true,
          level: Level.SUCCESS,
          withAutomaticClosing: true
        })
      )
      dispatch(
        addMainWindowBanner({
          children: bannerText,
          closingDelay: 5000,
          isClosable: true,
          level: Level.SUCCESS,
          withAutomaticClosing: true
        })
      )

      return true
    } catch (error) {
      dispatch(
        addSideWindowBanner({
          children: (error as Error).message,
          closingDelay: 5000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )

      return false
    }
  }
