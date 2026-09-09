import { reportingActions } from '@features/Reporting/slice'
import { GeoJSON, WKT } from 'ol/format'

import type { MainAppThunk } from '@store'

const geoJSONFormat = new GeoJSON()
const wktFormat = new WKT()

/**
 * Commits the zone drawn on the map to the reporting filters.
 *
 * The reporting map menu is hidden while the draw modal is open, so the zone cannot be picked up by
 * a component listening for the drawn geometry: it is read from the draw state instead, once the
 * user has validated the drawing.
 */
export const applyDrawedZoneFilter = (): MainAppThunk => (dispatch, getState) => {
  const { drawedGeometry } = getState().draw
  const { filters } = getState().reporting

  // The drawn geometry is stored as WGS84 GeoJSON, and the backend expects WKT.
  const zone = drawedGeometry ? wktFormat.writeGeometry(geoJSONFormat.readGeometry(drawedGeometry)) : undefined

  dispatch(reportingActions.setFilters({ ...filters, zone }))
}
