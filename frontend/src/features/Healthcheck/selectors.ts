import { selectIsPositionReplayActive } from '@features/PositionReplay/selectors'

import type { MainRootState } from '@store'

const NO_WARNING: string[] = []

/** The warnings are about the live data reception: they are irrelevant while replaying past positions. */
export const selectDisplayedHealthcheckTextWarning = (state: MainRootState): string[] =>
  selectIsPositionReplayActive(state) ? NO_WARNING : state.global.healthcheckTextWarning
