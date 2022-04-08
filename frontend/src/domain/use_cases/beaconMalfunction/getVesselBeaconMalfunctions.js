import { removeError, setError } from '../../shared_slices/Global'
import { batch } from 'react-redux'
import {
  loadVesselBeaconMalfunctions,
  resetOpenedBeaconMalfunction,
  setVesselBeaconMalfunctionsResumeAndHistory
} from '../../shared_slices/BeaconMalfunction'
import { getOnlyVesselIdentityProperties, vesselsAreEquals } from '../../entities/vessel'
import { getVesselBeaconsMalfunctionsFromAPI } from '../../../api/beaconMalfunction'

const getVesselBeaconMalfunctions = () => (dispatch, getState) => {
  const {
    selectedVessel
  } = getState().vessel
  if (!selectedVessel) {
    return
  }
  const vesselIdentity = getOnlyVesselIdentityProperties(selectedVessel)

  const {
    vesselBeaconMalfunctionsFromDate,
    /** @type {VesselBeaconMalfunctionsResumeAndHistory || null} */
    vesselBeaconMalfunctionsResumeAndHistory,
    /** @type {BeaconMalfunctionResumeAndDetails || null} */
    openedBeaconMalfunction
  } = getState().beaconMalfunction

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
      dispatch(resetOpenedBeaconMalfunction())
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
