import type { VesselEnhancedLastPositionWebGLObject } from '../../domain/entities/vessel/types'
import type { IFuseOptions } from 'fuse.js'

export const VESSEL_SEARCH_OPTIONS: IFuseOptions<VesselEnhancedLastPositionWebGLObject> = {
  distance: 50,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  includeScore: true,
  keys: ['vesselName', 'internalReferenceNumber', 'externalReferenceNumber', 'mmsi', 'ircs'],
  threshold: 0.4
}
