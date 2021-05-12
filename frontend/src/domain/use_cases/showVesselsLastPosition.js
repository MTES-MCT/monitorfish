import { getVesselsLastPositionsFromAPI } from '../../api/fetch'
import { setError } from '../reducers/Global'
import { setVessels } from '../reducers/Vessel'

const showVesselsLastPosition = () => dispatch => {
  getVesselsLastPositionsFromAPI().then(vessels => {
    dispatch(setVessels(vessels))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

export default showVesselsLastPosition
