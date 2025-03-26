import { EditDynamicVesselGroupDialog } from '@features/VesselGroup/components/EditDynamicVesselGroupDialog'
import { vesselGroupActions } from '@features/VesselGroup/slice'
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
      {isVesselGroupMainWindowEditionDisplayed && (
        <EditDynamicVesselGroupDialog
          editedVesselGroup={editedVesselGroup}
          initialListFilterValues={editedVesselGroup.filters}
          onExit={handleCloseEditVesselGroup}
        />
      )}
    </>
  )
}
