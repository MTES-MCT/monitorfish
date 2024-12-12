import { showRegulatoryZone } from './showRegulatoryZone'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type { HybridAppDispatch, HybridAppThunk } from '@store/types'

/**
 * Show a Regulatory topic
 */
export const showRegulatoryTopic =
  <T extends HybridAppDispatch>(topic: MonitorFishMap.TopicContainingMultipleZones): HybridAppThunk<T> =>
  // @ts-ignore Required to avoid reducers typing conflicts. Not fancy but allows us to keep Thunk context type-checks.
  dispatch =>
    topic.regulatoryZones.forEach(regulatoryZone => {
      dispatch(
        showRegulatoryZone({
          type: topic.type,
          ...regulatoryZone
        })
      )
    })
