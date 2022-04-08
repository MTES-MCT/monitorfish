import Feature from 'ol/Feature'
import {
  REGULATION_ACTION_TYPE,
  getRegulatoryFeatureId
} from '../../../entities/regulatory'
import updateRegulation from './updateRegulation'

const createRegulation = (featureObject, id) => (dispatch) => {
  const feature = new Feature(featureObject)
  feature.setId(getRegulatoryFeatureId(id))
  dispatch(updateRegulation(feature, REGULATION_ACTION_TYPE.UPDATE))
}

export default createRegulation
