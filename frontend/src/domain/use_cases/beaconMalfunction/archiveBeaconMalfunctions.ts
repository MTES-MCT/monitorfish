import { archiveBeaconMalfunctionsFromAPI } from '../../../api/beaconMalfunction'
import { setError } from '../../../features/MainWindow/slice'
import {
  setBeaconMalfunctions,
  setOpenedBeaconMalfunction,
  updateLocalBeaconMalfunctions,
  updateVesselBeaconMalfunctionsResumeAndHistory
} from '../../shared_slices/BeaconMalfunction'

/**
 * Archive multiple beacon malfunctions
 */
export const archiveBeaconMalfunctions = (ids: number[]) => (dispatch, getState) => {
  const previousBeaconMalfunctions = getState().beaconMalfunction.beaconMalfunctions

  const openedBeaconMalfunctionId = getState().beaconMalfunction.openedBeaconMalfunction?.beaconMalfunction?.id
  const currentVesselBeaconMalfunctionId =
    getState().beaconMalfunction.vesselBeaconMalfunctionsResumeAndHistory?.current?.beaconMalfunction?.id

  return archiveBeaconMalfunctionsFromAPI(ids)
    .then(updatedBeaconMalfunctionsWithDetails => {
      dispatch(
        updateLocalBeaconMalfunctions({
          beaconMalfunctions: updatedBeaconMalfunctionsWithDetails.map(beacon => beacon.beaconMalfunction)
        })
      )

      if (ids.includes(openedBeaconMalfunctionId)) {
        dispatch(
          setOpenedBeaconMalfunction({
            beaconMalfunction: updatedBeaconMalfunctionsWithDetails.find(
              beaconWithDetails => beaconWithDetails.beaconMalfunction.id === openedBeaconMalfunctionId
            ),
            showTab: false
          })
        )
      }

      if (ids.includes(currentVesselBeaconMalfunctionId)) {
        dispatch(
          updateVesselBeaconMalfunctionsResumeAndHistory(
            updatedBeaconMalfunctionsWithDetails.find(
              beaconWithDetails => beaconWithDetails.beaconMalfunction.id === currentVesselBeaconMalfunctionId
            )
          )
        )
      }
    })
    .catch(error => {
      dispatch(setError(error))
      dispatch(setBeaconMalfunctions(previousBeaconMalfunctions))
    })
}
