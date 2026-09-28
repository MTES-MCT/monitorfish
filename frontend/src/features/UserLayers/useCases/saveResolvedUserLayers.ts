import { saveUserLayers } from './saveUserLayers'
import { getUserLayersFromState, haveSameRegulatoryZoneIds } from '../utils'

import type { UserLayers } from '../types'
import type { MainAppThunk } from '@store'

/**
 * Persist the regulatory zone ids resolved to their current version (or removed if deleted),
 * so the stored user layers do not keep pointing to outdated zones.
 */
export const saveResolvedUserLayers =
  (loadedUserLayers: UserLayers): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const resolvedUserLayers = getUserLayersFromState(
      getState().layer.showedLayers,
      getState().regulation.selectedRegulatoryLayers,
      loadedUserLayers.baseLayer
    )
    if (haveSameRegulatoryZoneIds(loadedUserLayers, resolvedUserLayers)) {
      return
    }

    await dispatch(saveUserLayers(resolvedUserLayers))
  }
