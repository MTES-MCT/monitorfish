import Feature from 'ol/Feature'
import {
  REGULATION_ACTION_TYPE,
  getRegulatoryFeatureId, mapToRegulatoryFeatureObject
} from '../../../entities/regulatory'
import updateRegulation from './updateRegulation'
import resetPreviousRegulation from './resetRegulation'

const createOrUpdateRegulation = (processingRegulation, id, previousId) => dispatch => {
  console.log(processingRegulation, id, previousId)
  const featureObject = mapToRegulatoryFeatureObject({
    ...processingRegulation,
    region: processingRegulation.region?.join(', ')
  })

  const feature = new Feature(featureObject)
  feature.setId(getRegulatoryFeatureId(id))
  console.log(feature)
  dispatch(updateRegulation(feature, REGULATION_ACTION_TYPE.UPDATE))

  if (geometryHasChanged(previousId, id)) {
    dispatch(resetPreviousRegulation(previousId, id))
  }
}

function geometryHasChanged (previousId, id) {
  return previousId && previousId !== id
}

export default createOrUpdateRegulation
