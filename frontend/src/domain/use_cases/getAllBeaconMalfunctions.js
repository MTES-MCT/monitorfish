import { getAllBeaconMalfunctionsFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'
import { setBeaconMalfunctions } from '../shared_slices/BeaconMalfunction'

const getAllBeaconMalfunctions = () => dispatch => {
  getAllBeaconMalfunctionsFromAPI().then(beaconMalfunctions => {
    dispatch(setBeaconMalfunctions(beaconMalfunctions))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

export default getAllBeaconMalfunctions
