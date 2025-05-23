import { Vessel } from '@features/Vessel/Vessel.types'

import { VesselTrackDepth } from '../../../../types/vesselTrackDepth'

export type SelectableVesselTrackDepth = Exclude<VesselTrackDepth, VesselTrackDepth.CUSTOM>

export type VesselPositionWithId = Vessel.VesselPosition & { id: number }
