import { getAllBeaconMalfunctionsFromAPI } from '../../../api/beaconMalfunction'
import { setBeaconMalfunctions } from '../../shared_slices/BeaconMalfunction'
import { setError } from '../../shared_slices/Global'

const getAllBeaconMalfunctions = () => dispatch => {
  getAllBeaconMalfunctionsFromAPI()
    .then(beaconMalfunctions => {
      dispatch(setBeaconMalfunctions(beaconMalfunctions))
    })
    .catch(error => {
      console.error(error)
      dispatch(setError(error))
    })
}

export default getAllBeaconMalfunctions
