import { vesselApi } from '@features/Vessel/vesselApi'

import type { MainRootState } from '@store'

/**
 * Also `true` when the active vessels request failed, not to block what waits for them.
 */
export function getAreFirstActiveVesselsDisplayed(state: MainRootState): boolean {
  return state.global.areActiveVesselsDisplayed || vesselApi.endpoints.getActiveVessels.select()(state).isError
}
