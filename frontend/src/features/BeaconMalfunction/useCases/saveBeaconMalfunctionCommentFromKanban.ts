import { beaconMalfunctionApi } from '@features/BeaconMalfunction/apis'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import {
  setOpenedBeaconMalfunction,
  setOpenedBeaconMalfunctionsInKanban,
  updateVesselBeaconMalfunctionsResumeAndHistory
} from '../../../domain/shared_slices/BeaconMalfunction'

import type { UserType } from '@features/BeaconMalfunction/constants'
import type { MainAppThunk } from '@store'

export const saveBeaconMalfunctionCommentFromKanban =
  (beaconMalfunctionId: number, comment: string): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState()
    const { userType } = getState().global

    const newCommentInput = {
      comment,
      userType: userType as keyof typeof UserType
    }

    const beaconMalfunctionToUpdateIsOpenedAsCurrentVesselMalfunction =
      state.beaconMalfunction.vesselBeaconMalfunctionsResumeAndHistory?.current?.beaconMalfunction?.id ===
      beaconMalfunctionId
    const beaconMalfunctionToUpdateIsOpened =
      state.beaconMalfunction.openedBeaconMalfunction?.beaconMalfunction?.id === beaconMalfunctionId
    const beaconMalfunctionToUpdateIsOpenedInKanban =
      state.beaconMalfunction.openedBeaconMalfunctionInKanban?.beaconMalfunction?.id === beaconMalfunctionId

    try {
      const beaconMalfunctionWithDetails = await dispatch(
        beaconMalfunctionApi.endpoints.saveBeaconMalfunctionComment.initiate({
          comment: newCommentInput,
          id: beaconMalfunctionId
        })
      ).unwrap()

      if (beaconMalfunctionToUpdateIsOpened) {
        dispatch(
          setOpenedBeaconMalfunction({
            beaconMalfunction: beaconMalfunctionWithDetails,
            showTab: false
          })
        )
      }
      // If the malfunction is open in the Kanban view, update that slice.
      if (beaconMalfunctionToUpdateIsOpenedInKanban) {
        dispatch(setOpenedBeaconMalfunctionsInKanban(beaconMalfunctionWithDetails))
      }
      // If the malfunction is the current vessel malfunction, update that slice.
      if (beaconMalfunctionToUpdateIsOpenedAsCurrentVesselMalfunction) {
        dispatch(updateVesselBeaconMalfunctionsResumeAndHistory(beaconMalfunctionWithDetails))
      }
    } catch (error) {
      dispatch(
        addSideWindowBanner({
          children: (error as Error).message,
          closingDelay: 3000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }
