import { InteractionListener } from '@features/Map/constants'
import { filterVessels } from '@features/Vessel/useCases/VesselListV2/filterVessels'

import type { ZoneFilter } from '@features/Vessel/components/VesselListV2/types'
import type { MainAppThunk } from '@store'
import type { MultiPolygon } from 'geojson'

export const updateCustomZoneAndFilterVessels = (): MainAppThunk => async (dispatch, getState) => {
  const zones: ZoneFilter[] = getState().vessel.listFilterValues.zones ?? []
  const { drawedGeometry, listener } = getState().draw

  if (listener === InteractionListener.VESSELS_LIST && !!drawedGeometry) {
    const previousZonesWithoutCustomZone = zones.filter(zone => zone.value !== 'custom')

    const nextZones = [
      ...previousZonesWithoutCustomZone,
      {
        feature: drawedGeometry as MultiPolygon,
        label: 'Zone de filtre manuelle',
        value: 'custom' // TODO Rename to LayerType.CUSTOM
      }
    ]
    dispatch(filterVessels({ zones: nextZones }))
  }
}
