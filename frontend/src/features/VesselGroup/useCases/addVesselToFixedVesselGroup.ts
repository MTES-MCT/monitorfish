import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { saveActiveVesselsAndDisplayLastPositions } from '@features/Vessel/useCases/saveActiveVesselsAndDisplayLastPositions'
import { Vessel } from '@features/Vessel/Vessel.types'
import { vesselApi } from '@features/Vessel/vesselApi'
import { vesselGroupApi } from '@features/VesselGroup/apis'
import { Level } from '@mtes-mct/monitor-ui'

import type { FixedVesselGroup } from '@features/VesselGroup/types'
import type { MainAppThunk } from '@store'

export const addVesselToFixedVesselGroup =
  (vessel: Vessel.VesselIdentity | undefined, vesselGroup: FixedVesselGroup): MainAppThunk<Promise<void>> =>
  async (dispatch): Promise<void> => {
    try {
      if (!vessel) {
        return
      }

      const vesselGroupIdentity = {
        cfr: vessel.internalReferenceNumber,
        externalIdentification: vessel.externalReferenceNumber,
        flagState: vessel.flagState,
        ircs: vessel.ircs,
        name: vessel.vesselName,
        vesselId: vessel.vesselId,
        vesselIdentifier: vessel.vesselIdentifier
      }

      const vesselGroupWithVessel = {
        ...vesselGroup,
        vessels: vesselGroup.vessels.concat(vesselGroupIdentity)
      }

      await dispatch(vesselGroupApi.endpoints.createOrUpdateFixedVesselGroup.initiate(vesselGroupWithVessel)).unwrap()

      const vessels = await dispatch(
        vesselApi.endpoints.getActiveVessels.initiate(undefined, RTK_FORCE_REFETCH_QUERY_OPTIONS)
      ).unwrap()
      dispatch(saveActiveVesselsAndDisplayLastPositions(vessels))

      dispatch(
        addSideWindowBanner({
          children: `Le navire a bien été ajouté au groupe "${vesselGroup.name}"`,
          closingDelay: 2000,
          isClosable: true,
          level: Level.SUCCESS,
          withAutomaticClosing: true
        })
      )
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
    }
  }
