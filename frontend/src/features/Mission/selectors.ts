import { DataKind, selectIsDataAvailable } from '@features/PositionReplay/replayableData'

import type { MainRootState } from '@store'

export const selectIsMissionsLayerDisplayed = (state: MainRootState): boolean =>
  state.displayedComponent.isMissionsLayerDisplayed && selectIsDataAvailable(state, DataKind.MISSIONS)
