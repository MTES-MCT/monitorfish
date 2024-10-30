import type { VesselIdentity } from '../../../../domain/entities/vessel/types'
import type { IFuseOptions } from 'fuse.js'

export const VESSEL_SEARCH_OPTIONS: IFuseOptions<VesselIdentity> = {
  distance: 50,
  keys: ['vesselName', 'internalReferenceNumber', 'externalReferenceNumber', 'mmsi', 'ircs'],
  threshold: 0.4
}
