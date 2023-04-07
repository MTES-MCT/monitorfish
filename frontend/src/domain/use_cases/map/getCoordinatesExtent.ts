import { WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import { boundingExtent, buffer } from 'ol/extent'
import { transformExtent } from 'ol/proj'

import { OPENLAYERS_PROJECTION } from '../../entities/map/constants'

import type { Coordinate } from 'ol/coordinate'

export const getCoordinatesExtent = (coordinates: Coordinate) => {
  const extent = transformExtent(boundingExtent([coordinates]), WSG84_PROJECTION, OPENLAYERS_PROJECTION)

  return buffer(extent, 100)
}
