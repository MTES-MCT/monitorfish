import { THEME } from '@mtes-mct/monitor-ui'

import type { Vessel } from '@features/Vessel/Vessel.types'

export const TRACK_TYPE_RECORD: Record<TrackType, Vessel.TrackTypeRecordItem> = {
  ELLIPSIS: {
    arrow: 'map-icons/arrow_gray.png',
    code: 'ELLIPSIS',
    color: THEME.color.charcoalShadow,
    description: '🕐 > 4h'
  },
  FISHING: {
    arrow: 'map-icons/arrow_blue.png',
    code: 'FISHING',
    color: THEME.color.darkCornflowerBlue,
    description: 'En pêche'
  },
  TRANSIT: {
    arrow: 'map-icons/arrow_green.png',
    code: 'TRANSIT',
    color: THEME.color.jungleGreen,
    description: 'En transit'
  }
}

enum TrackType {
  ELLIPSIS = 'ELLIPSIS',
  FISHING = 'FISHING',
  TRANSIT = 'TRANSIT'
}
