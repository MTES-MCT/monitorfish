import { InteractionListener } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { filterVessels } from '@features/Vessel/useCases/VesselListV2/filterVessels'

import type { ZoneFilter } from '@features/Vessel/components/VesselList/types'
import type { MainAppThunk } from '@store'
import type { MultiPolygon } from 'geojson'

export const updateCustomZoneAndFilterVessels = (): MainAppThunk => async (dispatch, getState) => {
  const zones: ZoneFilter[] = getState().vessel.listFilterValues.zones ?? []
  const { drawedGeometry, listener } = getState().draw

  if (listener === InteractionListener.VESSELS_LIST && !!drawedGeometry) {
    const previousZonesWithoutCustomZone = zones.filter(zone => zone.value !== MonitorFishMap.MonitorFishLayer.CUSTOM)

    const nextZones = [
      ...previousZonesWithoutCustomZone,
      {
        feature: drawedGeometry as MultiPolygon,
        label: 'Zone de filtre manuelle',
        value: MonitorFishMap.MonitorFishLayer.CUSTOM
      }
    ]
    /**
     * /!\
     * `addOrEditMissionZone/openDrawLayerModal()` should set `areVesselsDisplayed` to true for the
     * vessels to be rendered, as `areVesselsDisplayed` unmount the layers and prevent the render
     * functions (i.e `renderVesselAlertFeatures`) to update the layers.
     */
    dispatch(filterVessels({ zones: nextZones }))
  }
}
