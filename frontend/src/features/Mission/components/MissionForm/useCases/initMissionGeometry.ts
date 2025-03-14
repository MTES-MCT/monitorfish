import { convertToGeoJSONGeometryObject } from '@features/Map/utils'
import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { MultiPolygon } from 'ol/geom'

import type { MultiPolygon as GeoJSONMultiPolygon } from 'geojson'

export const initMissionGeometry = dispatch => async (isGeometryComputedFromControls: boolean | undefined) => {
  if (!isGeometryComputedFromControls) {
    return
  }

  const emptyMissionGeometry = convertToGeoJSONGeometryObject<GeoJSONMultiPolygon>(new MultiPolygon([]))

  dispatch(missionFormActions.setGeometryComputedFromControls(emptyMissionGeometry))
}
