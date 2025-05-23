import type { VesselTrackDepth } from './vesselTrackDepth'
import type { SelectableVesselTrackDepth } from '@features/Vessel/components/VesselSidebar/components/TrackRequest/types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { Coordinates } from '@mtes-mct/monitor-ui'
import type { Coordinate } from 'ol/coordinate'

export type DisplayedLogbookOverlay = {
  /** The coordinates of the fishing activity */
  coordinates: Coordinates
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
