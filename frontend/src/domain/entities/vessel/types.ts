// TODO This should be moved to `entities/vessel/mission.types.ts`

import type { VesselTrackDepth } from '../vesselTrackDepth'
import type { SelectableVesselTrackDepth } from '@features/Vessel/components/VesselSidebar/actions/TrackRequest/types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { Coordinate } from 'ol/coordinate'

export type FishingActivityShowedOnMap = {
  /** The coordinates of the fishing activity */
  coordinates?: string[]
  /** The effective date of message */
  date: string
  /** The operation number for logbook */
  id: string
  /** true if the message was deleted */
  isDeleted: boolean
  /** true id the message was not acknowledged */
  isNotAcknowledged: boolean
  /** The message name */
  name: string
}

export type ShowedVesselTrack = {
  coordinates: Coordinate
  course: number
  extent: number[] | null
  isDefaultTrackDepth: boolean
  positions: Vessel.VesselPosition[]
  toHide: boolean
  toShow: boolean
  toZoom: boolean
  vesselCompositeIdentifier: string
  vesselIdentity: Vessel.VesselIdentity
}

export type TrackRequest = TrackRequestCustom | TrackRequestPredefined
export type TrackRequestCustom = {
  afterDateTime: Date
  beforeDateTime: Date
  trackDepth: VesselTrackDepth.CUSTOM
}
export type TrackRequestPredefined = {
  afterDateTime: null
  beforeDateTime: null
  trackDepth: SelectableVesselTrackDepth
}
