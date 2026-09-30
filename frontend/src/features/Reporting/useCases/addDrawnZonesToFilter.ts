import { reportingActions } from '@features/Reporting/slice'
import { addZones, readZonesFromGeometry } from '@features/Reporting/zoneFilter'
import { GeoJSON } from 'ol/format'

import type { MainAppThunk } from '@store'

const geoJSONFormat = new GeoJSON()

/**
 * The reporting map menu is hidden while the draw modal is open, so the zone cannot be picked up by
 * a component listening for the drawn geometry: it is read from the draw state instead, once the
 * user has validated the drawing.
 */
export const addDrawnZonesToFilter = (): MainAppThunk => (dispatch, getState) => {
  const { drawedGeometry } = getState().draw
  if (!drawedGeometry) {
    return
  }

  const { filters } = getState().reporting
  const drawnZones = readZonesFromGeometry(geoJSONFormat.readGeometry(drawedGeometry))

  dispatch(reportingActions.setFilters({ ...filters, zone: addZones(filters.zone, drawnZones) }))
}
