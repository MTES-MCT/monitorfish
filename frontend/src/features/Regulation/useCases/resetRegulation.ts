import Feature from 'ol/Feature'

import { updateRegulation } from './updateRegulation'
import { RegulationActionType, getRegulatoryFeatureId, emptyRegulatoryFeatureObject } from '../utils'

import type { BackofficeAppThunk } from '@store'

export const resetRegulation =
  (id: number | string | undefined, nextId: number | string | undefined): BackofficeAppThunk =>
  dispatch => {
    emptyRegulatoryFeatureObject.next_id = nextId
    const emptyFeature = new Feature(emptyRegulatoryFeatureObject)
    emptyFeature.setId(getRegulatoryFeatureId(id))

    dispatch(updateRegulation(emptyFeature, RegulationActionType.Update))
  }
