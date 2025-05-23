import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { displayVesselSidebarAndPositions } from '@features/Vessel/useCases/displayVesselSidebarAndPositions'
import { extractVesselIdentityProps } from '@features/Vessel/utils'
import { type FixedVesselGroup, type VesselIdentityForVesselGroup } from '@features/VesselGroup/types'
import { deleteVesselFromVesselGroup } from '@features/VesselGroup/useCases/deleteVesselFromVesselGroup'
import { trackEvent } from '@hooks/useTracking'
import { Level } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { isEqual } from 'lodash-es'

import type { MainAppThunk } from '@store'

export const removeVesselFromGroup =
  (group: FixedVesselGroup): MainAppThunk =>
  async (dispatch, getState) => {
    const { selectedVessel } = getState().vessel

    trackEvent({
      action: `Modification d'un groupe de navires depuis la fiche navire`,
      category: 'VESSEL_GROUP',
      name: group.name
    })

    try {
      assertNotNullish(selectedVessel)

      // TODO Remove the re-build of this object
      const selectedVesselIdentityForGroup: VesselIdentityForVesselGroup = {
        cfr: selectedVessel.internalReferenceNumber,
        externalIdentification: selectedVessel.externalReferenceNumber,
        flagState: selectedVessel.flagState,
        ircs: selectedVessel.ircs,
        name: selectedVessel.vesselName,
        vesselId: selectedVessel.vesselId,
        vesselIdentifier: selectedVessel.vesselIdentifier
      }
      const vesselIndex = group.vessels.findIndex(identity => isEqual(identity, selectedVesselIdentityForGroup))
      if (vesselIndex === -1) {
        throw new Error("Le navire n'a pas été trouvé dans le groupe.")
      }

      await dispatch(deleteVesselFromVesselGroup(group.id, vesselIndex))

      const vesselIdentity = extractVesselIdentityProps(selectedVessel)
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
