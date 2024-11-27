import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { MultiPolygon } from 'ol/geom'

import { convertToGeoJSONGeometryObject } from '../../../../MainMap/utils'

import type { GeoJSON } from '../../../../../domain/types/GeoJSON'

export const initMissionGeometry = dispatch => async (isGeometryComputedFromControls: boolean | undefined) => {
  if (!isGeometryComputedFromControls) {
    return
  }

  const emptyMissionGeometry = convertToGeoJSONGeometryObject(new MultiPolygon([])) as GeoJSON.MultiPolygon

  dispatch(missionFormActions.setGeometryComputedFromControls(emptyMissionGeometry))
}
