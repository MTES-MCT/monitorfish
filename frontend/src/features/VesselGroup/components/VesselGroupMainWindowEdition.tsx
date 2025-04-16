import { VesselFeature } from '@features/Vessel/types/vessel'
import { EditDynamicVesselGroupDialog } from '@features/VesselGroup/components/EditDynamicVesselGroupDialog'
import { EditFixedVesselGroupDialog } from '@features/VesselGroup/components/EditFixedVesselGroupDialog'
import { vesselGroupActions } from '@features/VesselGroup/slice'
import {
  type CreateOrUpdateDynamicVesselGroup,
  type CreateOrUpdateFixedVesselGroup,
  GroupType
} from '@features/VesselGroup/types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'

import { setDisplayedComponents } from '../../../domain/shared_slices/DisplayedComponent'

export function VesselGroupMainWindowEdition() {
  const dispatch = useMainAppDispatch()

  const isVesselGroupMainWindowEditionDisplayed = useMainAppSelector(
    state => state.displayedComponent.isVesselGroupMainWindowEditionDisplayed
  )
  const editedVesselGroup = useMainAppSelector(state => state.vesselGroup.editedVesselGroup)

  const handleCloseEditVesselGroup = () => {
    dispatch(vesselGroupActions.vesselGroupEdited(undefined))
    dispatch(setDisplayedComponents({ isVesselGroupMainWindowEditionDisplayed: false }))
  }

  if (!editedVesselGroup) {
    return undefined
  }

  return (
    <>
      {isVesselGroupMainWindowEditionDisplayed && editedVesselGroup.type === GroupType.DYNAMIC && (
        <EditDynamicVesselGroupDialog
          editedVesselGroup={editedVesselGroup}
          initialListFilterValues={(editedVesselGroup as CreateOrUpdateDynamicVesselGroup).filters}
          isMainWindow
          onExit={handleCloseEditVesselGroup}
        />
      )}
      {isVesselGroupMainWindowEditionDisplayed && editedVesselGroup.type === GroupType.FIXED && (
        <EditFixedVesselGroupDialog
          editedVesselGroup={editedVesselGroup}
          onExit={handleCloseEditVesselGroup}
          selectedVesselFeatureIds={(editedVesselGroup as CreateOrUpdateFixedVesselGroup).vessels.map(vessel =>
            VesselFeature.getVesselFeatureId(vessel)
          )}
        />
      )}
    </>
  )
}
