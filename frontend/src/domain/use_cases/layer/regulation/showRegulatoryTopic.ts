import showRegulatoryZone from './showRegulatoryZone'

import type { TopicContainingMultipleZones } from '../../../types/layer'

/**
 * Show a Regulatory topic
 */
export const showRegulatoryTopic = (topic: TopicContainingMultipleZones) => dispatch =>
  topic.regulatoryZones.forEach(regulatoryZone => {
    dispatch(
      showRegulatoryZone({
        namespace: topic.namespace,
        type: topic.type,
        ...regulatoryZone
      })
    )
  })
