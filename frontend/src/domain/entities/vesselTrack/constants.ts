import type Feature from 'ol/Feature'
import type LineString from 'ol/geom/LineString'
import type Point from 'ol/geom/Point'
import {theme} from "../../../ui/theme";

export interface VesselPointFeature extends Feature<Point> {
  course?: number
  dateTime?: string
  name?: string
  positionType?: string
  speed?: number
}

export interface VesselLineFeature extends Feature<LineString> {
  course?: number
  dateTime?: string
  firstPositionDate?: Date
  isTimeEllipsis?: boolean
  positionType?: string
  secondPositionDate?: Date
  speed?: number
  trackType?: TrackTypeRecordItem
}

export interface VesselArrowFeature extends Feature<Point> {
  course?: number
  name?: string
}

export const TRACK_TYPE_RECORD: Record<TrackType, TrackTypeRecordItem> = {
  ELLIPSIS: {
    arrow: 'arrow_gray.png',
    code: 'ELLIPSIS',
    color: theme.color.jungleGreen,
    description: '🕐 entre deux positions > 4h'
  },
  FISHING: {
    arrow: 'arrow_blue.png',
    code: 'FISHING',
    color: theme.color.darkCornflowerBlue,
    description: 'En pêche (vitesse <= 4.5 Nds)'
  },
  TRANSIT: {
    arrow: 'arrow_green.png',
    code: 'TRANSIT',
    color: theme.color.charcoalShadow,
    description: 'En transit (vitesse > 4.5 Nds)'
  }
}

enum TrackType {
  ELLIPSIS = 'ELLIPSIS',
  FISHING = 'FISHING',
  TRANSIT = 'TRANSIT'
}

type TrackTypeRecordItem = {
  arrow: string
  code: string
  color: string
  description: string
}
