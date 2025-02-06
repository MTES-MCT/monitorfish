import type { Vessel } from '@features/Vessel/Vessel.types'
import type { IFuseOptions } from 'fuse.js'

export const VESSEL_SEARCH_OPTIONS: IFuseOptions<Vessel.VesselLastPosition> = {
  distance: 50,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  includeScore: true,
  keys: ['vesselName', 'internalReferenceNumber', 'externalReferenceNumber', 'mmsi', 'ircs'],
  threshold: 0.4
}
