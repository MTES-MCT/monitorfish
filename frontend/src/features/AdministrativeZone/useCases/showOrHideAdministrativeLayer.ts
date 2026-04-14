import { hideLayer } from '@features/LayersSidebar/useCases/hideLayer'
import { layerActions } from '@features/Map/layer.slice'

import { renderAdministrativeLayers } from './renderAdministrativeLayers'

import type { MainAppThunk } from '../../../store'
import type { MonitorFishMap } from '@features/Map/Map.types'

export const showOrHideAdministrativeLayer =
  (zone: MonitorFishMap.AdminShowableLayer, isShown: boolean): MainAppThunk =>
  dispatch => {
    const type = zone.hasFetchableZones ? zone.group?.code!! : zone.code
    const zoneCode = zone.hasFetchableZones ? zone.code : undefined

    if (isShown) {
      dispatch(hideLayer({ id: undefined, topic: undefined, type, zone: zoneCode }))
    } else {
      dispatch(layerActions.addShowedLayer({ type, zone: zoneCode }))
    }

    dispatch(renderAdministrativeLayers())
  }
