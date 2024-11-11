import type { Vessel } from '../../Vessel.types'
import type { IFuseOptions } from 'fuse.js'

export const VESSEL_SEARCH_OPTIONS: IFuseOptions<Vessel.VesselIdentity> = {
  distance: 50,
  keys: ['vesselName', 'internalReferenceNumber', 'externalReferenceNumber', 'mmsi', 'ircs'],
  threshold: 0.4
}
