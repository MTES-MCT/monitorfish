import Feature from 'ol/Feature'

import { resetRegulation } from './resetRegulation'
import { updateRegulation } from './updateRegulation'
import { getRegulatoryFeatureId, mapToRegulatoryFeatureObject, RegulationActionType } from '../utils'

import type { RegulatoryZoneDraft } from '../types'
import type { BackofficeAppThunk } from '@store'

export const createOrUpdateBackofficeRegulation =
  (
    processingRegulation: RegulatoryZoneDraft,
    previousId: number | string | undefined
  ): BackofficeAppThunk<Promise<void>> =>
  async dispatch => {
    const featureObject = mapToRegulatoryFeatureObject({
      ...processingRegulation,
      region: processingRegulation.region?.join(', ')
    })

    const feature = new Feature(featureObject)
    feature.setId(getRegulatoryFeatureId(processingRegulation.id))
    if (isGeometryModified(previousId, processingRegulation.id)) {
      /**
       * We first need to reset the previous regulation as there is an UNIQUE CONSTRAINT (topic, zone) of the table.
       * /!\ This constraint is only applied to the local (CROSS) regulations table.
       */
      dispatch(resetRegulation(previousId, processingRegulation.id))

      /**
       * We must wait for the reset to be done.
       * TODO Add the two UPDATE into the same transaction to remove this `setTimeout`
       */
      setTimeout(() => {
        /**
         * Then, we update the new regulation with the values of the previous one
         */
        dispatch(updateRegulation(feature, RegulationActionType.Update))
      }, 1000)

      return
    }

    /**
     * Then, we update the new regulation with the values of the previous one
     */
    await dispatch(updateRegulation(feature, RegulationActionType.Update))
  }

function isGeometryModified(previousId: number | string | undefined, id: number | string | undefined) {
  return previousId && previousId !== id
}
