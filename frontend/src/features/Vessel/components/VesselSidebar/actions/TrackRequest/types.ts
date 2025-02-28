import { VesselTrackDepth } from '../../../../types/vesselTrackDepth'

export type SelectableVesselTrackDepth = Exclude<VesselTrackDepth, VesselTrackDepth.CUSTOM>
