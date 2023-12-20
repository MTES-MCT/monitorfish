import type { VesselEnhancedLastPositionWebGLObject } from '../../domain/entities/vessel/types'
import type { IFuseOptions } from 'fuse.js'

export const VESSEL_SEARCH_OPTIONS: IFuseOptions<VesselEnhancedLastPositionWebGLObject> = {
  distance: 50,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  includeScore: true,
  keys: [
    ['vesselProperties', 'vesselName'],
    ['vesselProperties', 'internalReferenceNumber'],
    ['vesselProperties', 'externalReferenceNumber'],
    ['vesselProperties', 'mmsi'],
    ['vesselProperties', 'ircs']
  ],
  threshold: 0.4
}
