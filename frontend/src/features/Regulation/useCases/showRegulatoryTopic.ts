import { showRegulatoryZone } from './showRegulatoryZone'

import type { MainMap } from '@features/MainMap/MainMap.types'
import type { MainAppThunk } from '@store'

/**
 * Show a Regulatory topic
 */
export const showRegulatoryTopic =
  (topic: MainMap.TopicContainingMultipleZones): MainAppThunk =>
  dispatch =>
    topic.regulatoryZones.forEach(regulatoryZone => {
      dispatch(
        showRegulatoryZone({
          type: topic.type,
          ...regulatoryZone
        })
      )
    })
