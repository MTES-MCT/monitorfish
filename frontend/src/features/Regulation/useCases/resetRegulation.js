import Feature from 'ol/Feature'
import {
  REGULATION_ACTION_TYPE,
  getRegulatoryFeatureId,
  emptyRegulatoryFeatureObject
} from '../utils'
import updateRegulation from './updateRegulation'

const resetRegulation = (id, nextId) => (dispatch) => {
  emptyRegulatoryFeatureObject.next_id = nextId
  const emptyFeature = new Feature(emptyRegulatoryFeatureObject)
  emptyFeature.setId(getRegulatoryFeatureId(id))
  dispatch(updateRegulation(emptyFeature, REGULATION_ACTION_TYPE.UPDATE))
}

export default resetRegulation
