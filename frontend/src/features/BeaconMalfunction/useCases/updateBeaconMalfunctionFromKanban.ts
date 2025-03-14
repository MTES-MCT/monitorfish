import { beaconMalfunctionApi } from '@features/BeaconMalfunction/apis'

import {
  setBeaconMalfunctions,
  setOpenedBeaconMalfunction,
  setOpenedBeaconMalfunctionsInKanban,
  updateLocalBeaconMalfunction,
  updateVesselBeaconMalfunctionsResumeAndHistory
} from '../../../domain/shared_slices/BeaconMalfunction'
import { setError } from '../../../domain/shared_slices/Global'

import type { BeaconMalfunction, UpdateBeaconMalfunction } from '@features/BeaconMalfunction/types'
import type { MainAppThunk } from '@store'

export const updateBeaconMalfunctionFromKanban =
  (
    id: number,
    nextBeaconMalfunction: BeaconMalfunction,
    updatedFields: UpdateBeaconMalfunction
  ): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    // Save the current beacon malfunctions for potential rollback.
    const previousBeaconMalfunctions = getState().beaconMalfunction.beaconMalfunctions

    // Perform an optimistic update in the local state.
    dispatch(updateLocalBeaconMalfunction(nextBeaconMalfunction))

    const state = getState()
    const beaconMalfunctionToUpdateIsOpenedAsCurrentVesselMalfunction =
      state.beaconMalfunction.vesselBeaconMalfunctionsResumeAndHistory?.current?.beaconMalfunction?.id === id
    const beaconMalfunctionToUpdateIsOpened =
      state.beaconMalfunction.openedBeaconMalfunction?.beaconMalfunction?.id === id
    const beaconMalfunctionToUpdateIsOpenedInKanban =
      state.beaconMalfunction.openedBeaconMalfunctionInKanban?.beaconMalfunction?.id === id

    try {
      const updatedBeaconMalfunctionWithDetails = await dispatch(
        beaconMalfunctionApi.endpoints.updateBeaconMalfunction.initiate({
          id,
          updatedFields
        })
      ).unwrap()

      if (beaconMalfunctionToUpdateIsOpened) {
        dispatch(
          setOpenedBeaconMalfunction({
            beaconMalfunction: updatedBeaconMalfunctionWithDetails,
            showTab: false
          })
        )
      }
      if (beaconMalfunctionToUpdateIsOpenedInKanban) {
        dispatch(setOpenedBeaconMalfunctionsInKanban(updatedBeaconMalfunctionWithDetails))
      }
      if (beaconMalfunctionToUpdateIsOpenedAsCurrentVesselMalfunction) {
        dispatch(updateVesselBeaconMalfunctionsResumeAndHistory(updatedBeaconMalfunctionWithDetails))
      }
    } catch (error) {
      dispatch(setError(error))
      dispatch(setBeaconMalfunctions(previousBeaconMalfunctions))
    }
  }
