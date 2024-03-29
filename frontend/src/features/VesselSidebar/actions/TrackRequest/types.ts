import { VesselTrackDepth } from '../../../../domain/entities/vesselTrackDepth'

export type SelectableVesselTrackDepth = Exclude<VesselTrackDepth, VesselTrackDepth.CUSTOM>
