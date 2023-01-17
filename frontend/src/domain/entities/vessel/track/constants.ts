import { THEME } from '@mtes-mct/monitor-ui'

import type { TrackTypeRecordItem } from '../types'

export const TRACK_TYPE_RECORD: Record<TrackType, TrackTypeRecordItem> = {
  ELLIPSIS: {
    arrow: 'arrow_gray.png',
    code: 'ELLIPSIS',
    color: THEME.color.charcoalShadow,
    description: '🕐 > 4h'
  },
  FISHING: {
    arrow: 'arrow_blue.png',
    code: 'FISHING',
    color: THEME.color.darkCornflowerBlue,
    description: 'En pêche'
  },
  TRANSIT: {
    arrow: 'arrow_green.png',
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
