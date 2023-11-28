import Feature from 'ol/Feature'

import resetPreviousRegulation from './resetRegulation'
import updateRegulation from './updateRegulation'
import { getRegulatoryFeatureId, mapToRegulatoryFeatureObject, REGULATION_ACTION_TYPE } from '../utils'

export const createOrUpdateRegulation = (processingRegulation, id, previousId) => async dispatch => {
  const featureObject = mapToRegulatoryFeatureObject({
    ...processingRegulation,
    region: processingRegulation.region?.join(', ')
  })

  const feature = new Feature(featureObject)
  feature.setId(getRegulatoryFeatureId(id))
  if (isGeometryModified(previousId, id)) {
    /**
     * We first need to reset the previous regulation as there is an UNIQUE CONSTRAINT (topic, zone) of the table.
     * /!\ This constraint is only applied to the local (CROSS) regulations table.
     */
    await dispatch(resetPreviousRegulation(previousId, id))

    /**
     * We must wait for the reset to be done.
     * TODO Add the two UPDATE into the same transaction to remove this `setTimeout`
     */
    setTimeout(() => {
      /**
       * Then, we update the new regulation with the values of the previous one
       */
      dispatch(updateRegulation(feature, REGULATION_ACTION_TYPE.UPDATE))
    }, 1000)

    return
  }

  /**
   * Then, we update the new regulation with the values of the previous one
   */
  await dispatch(updateRegulation(feature, REGULATION_ACTION_TYPE.UPDATE))
}

function isGeometryModified(previousId, id) {
  return previousId && previousId !== id
}
