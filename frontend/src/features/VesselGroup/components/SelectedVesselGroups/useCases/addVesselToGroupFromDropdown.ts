import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { displayVesselSidebarAndPositions } from '@features/Vessel/useCases/displayVesselSidebarAndPositions'
import { extractVesselIdentityProps } from '@features/Vessel/utils'
import { type FixedVesselGroup } from '@features/VesselGroup/types'
import { addVesselToFixedVesselGroup } from '@features/VesselGroup/useCases/addVesselToFixedVesselGroup'
import { trackEvent } from '@hooks/useTracking'
import { Level } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'

import type { MainAppThunk } from '@store'

export const addVesselToGroupFromDropdown =
  (vesselGroup: FixedVesselGroup): MainAppThunk =>
  async (dispatch, getState) => {
    const { selectedVessel } = getState().vessel

    try {
      assertNotNullish(selectedVessel)
      const vesselIdentity = extractVesselIdentityProps(selectedVessel)

      trackEvent({
        action: `Modification d'un groupe de navires depuis la fiche navire`,
        category: 'VESSEL_GROUP',
        name: vesselGroup.name
      })
      await dispatch(addVesselToFixedVesselGroup(vesselIdentity, vesselGroup, false))

      dispatch(displayVesselSidebarAndPositions(vesselIdentity, false))
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
