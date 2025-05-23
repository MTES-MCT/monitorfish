import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { displayVesselSidebarAndPositions } from '@features/Vessel/useCases/displayVesselSidebarAndPositions'
import { extractVesselIdentityProps } from '@features/Vessel/utils'
import { vesselGroupApi } from '@features/VesselGroup/apis'
import { GroupType, type VesselIdentityForVesselGroup } from '@features/VesselGroup/types'
import { addVesselToFixedVesselGroup } from '@features/VesselGroup/useCases/addVesselToFixedVesselGroup'
import { deleteVesselFromVesselGroup } from '@features/VesselGroup/useCases/deleteVesselFromVesselGroup'
import { trackEvent } from '@hooks/useTracking'
import { Level } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { difference, isEqual } from 'lodash-es'

import type { MainAppThunk } from '@store'

export const addOrRemoveVesselToGroupFromCheckPicker =
  (currentVesselGroupIds: number[] | undefined, nextGroupIds: number[]): MainAppThunk =>
  async (dispatch, getState) => {
    const { selectedVessel } = getState().vessel
    const vesselGroups = await dispatch(vesselGroupApi.endpoints.getAllVesselGroups.initiate(undefined)).unwrap()

    try {
      assertNotNullish(selectedVessel)
      assertNotNullish(vesselGroups)
      const vesselIdentity = extractVesselIdentityProps(selectedVessel)

      const groupsAdded = difference(nextGroupIds, currentVesselGroupIds ?? [])
      if (groupsAdded.length === 1) {
        const groupAdded = groupsAdded[0]

        const editedVesselGroup = vesselGroups.find(group => group.id === groupAdded)
        if (!editedVesselGroup || editedVesselGroup.type !== GroupType.FIXED) {
          return
        }

        trackEvent({
          action: `Modification d'un groupe de navires depuis la fiche navire`,
          category: 'VESSEL_GROUP',
          name: editedVesselGroup.name
        })
        dispatch(addVesselToFixedVesselGroup(vesselIdentity, editedVesselGroup))
      }

      const groupsRemoved = difference(currentVesselGroupIds ?? [], nextGroupIds)
      if (groupsRemoved.length === 1) {
        const groupRemoved = groupsRemoved[0]

        const editedVesselGroup = vesselGroups.find(group => group.id === groupRemoved)
        if (!editedVesselGroup || editedVesselGroup.type !== GroupType.FIXED) {
          return
        }

        const selectedVesselIdentityForGroup: VesselIdentityForVesselGroup = {
          cfr: selectedVessel.internalReferenceNumber,
          externalIdentification: selectedVessel.externalReferenceNumber,
          flagState: selectedVessel.flagState,
          ircs: selectedVessel.ircs,
          name: selectedVessel.vesselName,
          vesselId: selectedVessel.vesselId,
          vesselIdentifier: selectedVessel.vesselIdentifier
        }
        const vesselIndex = editedVesselGroup.vessels.findIndex(identity =>
          isEqual(identity, selectedVesselIdentityForGroup)
        )
        if (vesselIndex === -1) {
          throw new Error("Le navire n'a pas été trouvé dans le groupe.")
        }

        trackEvent({
          action: `Modification d'un groupe de navires depuis la fiche navire`,
          category: 'VESSEL_GROUP',
          name: editedVesselGroup.name
        })
        dispatch(deleteVesselFromVesselGroup(editedVesselGroup.id, vesselIndex))
      }

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
