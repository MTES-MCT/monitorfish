import { DataKind, selectIsDataAvailable } from '@features/PositionReplay/replayableData'

import type { MainRootState } from '@store'

export const selectIsReportingLayerDisplayed = (state: MainRootState): boolean =>
  state.displayedComponent.isReportingLayerDisplayed && selectIsDataAvailable(state, DataKind.REPORTINGS)

/** Pinned reportings are displayed even when the reporting layer is hidden. */
export const selectArePinnedReportingsDisplayed = (state: MainRootState): boolean =>
  selectIsDataAvailable(state, DataKind.REPORTINGS)
