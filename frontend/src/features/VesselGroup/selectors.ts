import { DataKind, selectIsDataAvailable } from '@features/PositionReplay/replayableData'

import type { MainRootState } from '@store'

export const selectAreVesselsNotInVesselGroupsHidden = (state: MainRootState): boolean =>
  state.vesselGroup.areVesselsNotInVesselGroupsHidden && selectIsDataAvailable(state, DataKind.VESSEL_GROUPS)
