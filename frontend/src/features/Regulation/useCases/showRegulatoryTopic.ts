import { showRegulatoryZone } from './showRegulatoryZone'

import type { TopicContainingMultipleZones } from '../../../domain/types/layer'
import type { MainAppThunk } from '@store'

/**
 * Show a Regulatory topic
 */
export const showRegulatoryTopic =
  (topic: TopicContainingMultipleZones): MainAppThunk =>
  dispatch =>
    topic.regulatoryZones.forEach(regulatoryZone => {
      dispatch(
        showRegulatoryZone({
          type: topic.type,
          ...regulatoryZone
        })
      )
    })
