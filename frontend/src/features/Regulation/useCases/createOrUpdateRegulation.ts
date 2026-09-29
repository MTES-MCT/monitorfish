import Feature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'

import { updateRegulation } from './updateRegulation'
import { getRegulatoryFeatureId, mapToRegulatoryFeatureObject, RegulationActionType } from '../utils'

import type { RegulatoryZoneDraft } from '../types'
import type { BackofficeAppThunk } from '@store'
import type { Polygon } from 'geojson'

/**
 * When editing a regulation, the picked geometry is copied into the regulation row (and the geometry row deleted)
 * rather than moving the regulation to the geometry row: regulation ids must stay stable as they are saved in the
 * user layers.
 */
export const createOrUpdateBackofficeRegulation =
  (processingRegulation: RegulatoryZoneDraft, pickedGeometry: Polygon | undefined): BackofficeAppThunk<Promise<void>> =>
  async dispatch => {
    const { geometryId, id } = processingRegulation
    const regulationFeature = new Feature(
      mapToRegulatoryFeatureObject({
        ...processingRegulation,
        region: processingRegulation.region?.join(', ')
      })
    )

    if (!id || !geometryId || geometryId === String(id)) {
      regulationFeature.setId(getRegulatoryFeatureId(id ?? geometryId))
      await dispatch(updateRegulation({ updates: [regulationFeature] }, RegulationActionType.Update))

      return
    }

    if (!pickedGeometry) {
      throw new Error(`Geometry ${geometryId} not found.`)
    }

    regulationFeature.setId(getRegulatoryFeatureId(id))
    regulationFeature.setGeometry(new GeoJSON().readGeometry(pickedGeometry))
    const geometryRowFeature = new Feature()
    geometryRowFeature.setId(getRegulatoryFeatureId(geometryId))

    await dispatch(
      updateRegulation({ deletes: [geometryRowFeature], updates: [regulationFeature] }, RegulationActionType.Update)
    )
  }
