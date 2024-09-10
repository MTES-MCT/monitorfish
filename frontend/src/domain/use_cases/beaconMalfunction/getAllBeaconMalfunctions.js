import { getAllBeaconMalfunctionsFromAPI } from '../../../api/beaconMalfunction'
import { setError } from '../../../features/MainWindow/slice'
import { setBeaconMalfunctions } from '../../shared_slices/BeaconMalfunction'

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
