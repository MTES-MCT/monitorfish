import { getVesselBeaconsMalfunctionsFromAPI } from '../../api/fetch'
import { removeError, setError } from '../shared_slices/Global'
import { batch } from 'react-redux'
import {
  loadVesselBeaconMalfunctions, setOpenedBeaconMalfunction,
  setVesselBeaconMalfunctionsResumeAndHistory
} from '../shared_slices/BeaconStatus'
import { getOnlyVesselIdentityProperties, vesselsAreEquals } from '../entities/vessel'

const getVesselBeaconMalfunctions = () => (dispatch, getState) => {
  const {
    selectedVessel
  } = getState().vessel
  const vesselIdentity = getOnlyVesselIdentityProperties(selectedVessel)

  const {
    vesselBeaconMalfunctionsFromDate,
    /** @type {VesselBeaconMalfunctionsResumeAndHistory || null} */
    vesselBeaconMalfunctionsResumeAndHistory,
    /** @type {BeaconStatusWithDetails || null} */
    openedBeaconMalfunction
  } = getState().beaconStatus

  const isSameVesselAsCurrentlyShowed = vesselsAreEquals(vesselIdentity, selectedVessel)

  if (!isSameVesselAsCurrentlyShowed || !vesselBeaconMalfunctionsResumeAndHistory) {
    dispatch(loadVesselBeaconMalfunctions())
  }

  getVesselBeaconsMalfunctionsFromAPI(vesselIdentity, vesselBeaconMalfunctionsFromDate).then(vesselBeaconsMalfunctions => {
    dispatch(setVesselBeaconMalfunctionsResumeAndHistory({
      ...vesselBeaconsMalfunctions,
      vesselIdentity
    }))

    if (openedBeaconMalfunction) {
      const nextOpenedBeaconMalfunction = vesselBeaconsMalfunctions.history
        .find(beaconMalfunction => beaconMalfunction.beaconStatus.id === openedBeaconMalfunction.beaconStatus.id)
      if (nextOpenedBeaconMalfunction) {
        dispatch(setOpenedBeaconMalfunction(nextOpenedBeaconMalfunction))
      }
    }

    dispatch(removeError())
  }).catch(error => {
    console.error(error)
    batch(() => {
      dispatch(setError(error))
    })
  })
}

export default getVesselBeaconMalfunctions
