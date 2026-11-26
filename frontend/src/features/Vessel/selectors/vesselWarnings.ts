import { DataKind, selectIsDataAvailable } from '@features/PositionReplay/replayableData'

import type { MainRootState } from '@store'

export const selectAreVesselAlertsAndBeaconMalfunctionsDisplayed = (state: MainRootState): boolean =>
  selectIsDataAvailable(state, DataKind.ALERTS) && selectIsDataAvailable(state, DataKind.BEACON_MALFUNCTIONS)

export const selectAreVesselInfractionSuspicionsDisplayed = (state: MainRootState): boolean =>
  selectIsDataAvailable(state, DataKind.INFRACTION_SUSPICIONS)
