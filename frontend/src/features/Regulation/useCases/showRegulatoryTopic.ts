import { showRegulatoryZone } from './showRegulatoryZone'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type { HybridAppThunk } from '@store/types'

/**
 * Show a Regulatory topic
 */
export const showRegulatoryTopic =
  (topic: MonitorFishMap.TopicContainingMultipleZones): HybridAppThunk =>
  dispatch =>
    topic.regulatoryZones.forEach(regulatoryZone => {
      dispatch(
        showRegulatoryZone({
          type: topic.type,
          ...regulatoryZone
        })
      )
    })
