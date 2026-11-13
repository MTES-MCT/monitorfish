import { vesselApi } from '@features/Vessel/vesselApi'

import type { MainRootState } from '@store'

export function getAreFirstActiveVesselsDisplayedOrFailed(state: MainRootState): boolean {
  return state.global.areActiveVesselsDisplayed || vesselApi.endpoints.getActiveVessels.select()(state).isError
}
