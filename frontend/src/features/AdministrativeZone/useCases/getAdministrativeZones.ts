import { LayerProperties as LayersEnum, LayerType } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { administrativeLayers } from '@features/Map/utils'

import { geoserverApi } from '../../../api/geoserverApi'

export type GroupAndZones = {
  group: MonitorFishMap.CodeAndName
  zones: MonitorFishMap.ShowableLayer[]
}

export type GroupedZonesAndZones = {
  groupedZones: GroupAndZones[]
  zones: MonitorFishMap.ShowableLayer[]
}

export const getAdministrativeZones =
  () =>
  async (dispatch, getState): Promise<GroupedZonesAndZones> => {
    const nonGroupedZones = administrativeLayers.filter(zone => !zone.group)

    const groups = administrativeLayers
      .filter(zone => zone.group)
      .filter(zone => !zone.hasFetchableZones)
      .map(zone => zone.group)
    const uniqueGroups = Array.from(new Set(groups))
    const groupedZones: GroupAndZones[] = uniqueGroups.map(group => ({
      group: group!,
      zones: administrativeLayers.filter(zone => zone.group && zone.group === group)
    }))

    const groupedZonesToFetch: Promise<GroupAndZones>[] = Object.keys(LayersEnum)
      .map(layer => LayersEnum[layer])
      .filter((zone): zone is MonitorFishMap.ShowableLayer => zone !== undefined)
      .filter(zone => zone.type === LayerType.ADMINISTRATIVE)
      .filter(zone => zone.hasFetchableZones)
      .map(async zone => {
        const fetchedZones = await dispatch(
          geoserverApi.endpoints.getAdministrativeSubZones.initiate({
            fromBackoffice: getState().global.isBackoffice,
            type: zone.code
          })
        ).unwrap()

        const nextZones: MonitorFishMap.ShowableLayer[] = fetchedZones.features.map(feature => ({
          code: feature.id!.toString(),
          group: zone.group,
          hasFetchableZones: zone.hasFetchableZones!,
          name: (zone.zoneNamePropertyKey && feature.properties?.[zone.zoneNamePropertyKey]?.toString()) ?? 'Aucun nom',
          type: LayerType.ADMINISTRATIVE
        }))

        return {
          group: zone.group!,
          zones: nextZones
        }
      })

    return Promise.all(groupedZonesToFetch).then(fetchedGroupedZones => ({
      groupedZones: [...groupedZones, ...fetchedGroupedZones],
      zones: nonGroupedZones
    }))
  }
