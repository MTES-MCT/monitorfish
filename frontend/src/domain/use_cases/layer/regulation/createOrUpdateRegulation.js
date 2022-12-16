import Feature from 'ol/Feature'
import {
  REGULATION_ACTION_TYPE,
  getRegulatoryFeatureId, mapToRegulatoryFeatureObject
} from '../../../entities/regulation'
import updateRegulation from './updateRegulation'
import resetPreviousRegulation from './resetRegulation'

const createOrUpdateRegulation = (processingRegulation, id, previousId) => dispatch => {
  const featureObject = mapToRegulatoryFeatureObject({
    ...processingRegulation,
    region: processingRegulation.region?.join(', ')
  })

  const feature = new Feature(featureObject)
  feature.setId(getRegulatoryFeatureId(id))
  dispatch(updateRegulation(feature, REGULATION_ACTION_TYPE.UPDATE))

  if (geometryHasChanged(previousId, id)) {
    dispatch(resetPreviousRegulation(previousId, id))
  }
}

function geometryHasChanged (previousId, id) {
  return previousId && previousId !== id
}

export default createOrUpdateRegulation
