import { DataKind, selectIsDataAvailable } from '@features/PositionReplay/replayableData'

import type { MainRootState } from '@store'

export const selectAreVesselsEstimatedPositionsDisplayed = (state: MainRootState): boolean =>
  state.map.showingVesselsEstimatedPositions && selectIsDataAvailable(state, DataKind.ESTIMATED_POSITIONS)

export const selectIsRiskFactorDisplayed = (state: MainRootState): boolean =>
  state.map.riskFactorShowedOnMap && selectIsDataAvailable(state, DataKind.RISK_FACTOR)
