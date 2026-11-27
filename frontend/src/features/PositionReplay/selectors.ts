import { VMS_REPLAY_LOOKBACK_IN_HOURS } from '@features/PositionReplay/constants'
import { PositionReplayStatus } from '@features/PositionReplay/slice'

import type { MainRootState } from '@store'

export const selectIsPositionReplayActive = (state: MainRootState): boolean =>
  state.positionReplay.status !== PositionReplayStatus.OFF

/** The date the positions are displayed at: the replayed date, or `undefined` for now. */
export const selectPositionsDateTime = (state: MainRootState): string | undefined =>
  state.positionReplay.status === PositionReplayStatus.REPLAYING ? state.positionReplay.dateTime : undefined

/** Older VMS positions are not fetched while replaying. */
export const selectMaxLastPositionHoursAgo = (state: MainRootState): number | undefined =>
  selectIsPositionReplayActive(state) ? VMS_REPLAY_LOOKBACK_IN_HOURS : undefined
