import Feature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'

import { updateRegulation } from './updateRegulation'
import { getRegulatoryFeatureId, mapToRegulatoryFeatureObject, RegulationActionType } from '../utils'

import type { RegulatoryZoneDraft } from '../types'
import type { BackofficeAppThunk } from '@store'
import type { Polygon } from 'geojson'

/**
 * When another geometry is picked, it is copied into the regulation row (and its own row deleted) rather than
 * moving the regulation to the geometry row: regulation ids must stay stable as they are saved in the user layers.
 */
export const createOrUpdateBackofficeRegulation =
  (
    processingRegulation: RegulatoryZoneDraft,
    previousId: number | string | undefined,
    pickedGeometry: Polygon | undefined
  ): BackofficeAppThunk<Promise<void>> =>
  async dispatch => {
    const regulationFeature = new Feature(
      mapToRegulatoryFeatureObject({
        ...processingRegulation,
        region: processingRegulation.region?.join(', ')
      })
    )

    if (!previousId || previousId === processingRegulation.id) {
      regulationFeature.setId(getRegulatoryFeatureId(processingRegulation.id))
      await dispatch(updateRegulation({ updates: [regulationFeature] }, RegulationActionType.Update))

      return
    }

    if (!pickedGeometry) {
      throw new Error(`Geometry ${processingRegulation.id} not found.`)
    }

    regulationFeature.setId(getRegulatoryFeatureId(previousId))
    regulationFeature.setGeometry(new GeoJSON().readGeometry(pickedGeometry))
    const pickedGeometryFeature = new Feature()
    pickedGeometryFeature.setId(getRegulatoryFeatureId(processingRegulation.id))

    await dispatch(
      updateRegulation({ deletes: [pickedGeometryFeature], updates: [regulationFeature] }, RegulationActionType.Update)
    )
  }
