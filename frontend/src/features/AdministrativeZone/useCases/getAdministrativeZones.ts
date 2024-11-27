import { MainMap } from '@features/MainMap/MainMap.types'

import { getAdministrativeSubZonesFromAPI } from '../../../api/geoserver'
import { LayerProperties as LayersEnum, LayerType } from '../../MainMap/constants'
import { administrativeLayers } from '../../MainMap/utils'

import type { GeoJSON } from '../../../domain/types/GeoJSON'

export type GroupAndZones = {
  group: MainMap.CodeAndName
  zones: MainMap.ShowableLayer[]
}

export type GroupedZonesAndZones = {
  groupedZones: GroupAndZones[]
  zones: MainMap.ShowableLayer[]
}

export const getAdministrativeZones =
  () =>
  async (_, getState): Promise<GroupedZonesAndZones> => {
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
      .filter((zone): zone is MainMap.ShowableLayer => zone !== undefined)
      .filter(zone => zone.type === LayerType.ADMINISTRATIVE)
      .filter(zone => zone.hasFetchableZones)
      .map(zone =>
        getAdministrativeSubZonesFromAPI(zone.code, getState().global.isBackoffice).then(
          (fetchedZones: GeoJSON.FeatureCollection) => {
            const nextZones: MainMap.ShowableLayer[] = fetchedZones.features.map(feature => ({
              code: feature.id!.toString(),
              group: zone.group,
              hasFetchableZones: zone.hasFetchableZones!,
              name:
                (zone.zoneNamePropertyKey && feature.properties?.[zone.zoneNamePropertyKey]?.toString()) ?? 'Aucun nom',
              type: LayerType.ADMINISTRATIVE
            }))

            return {
              group: zone.group!,
              zones: nextZones
            }
          }
        )
      )

    return Promise.all(groupedZonesToFetch).then(fetchedGroupedZones => ({
      groupedZones: [...groupedZones, ...fetchedGroupedZones],
      zones: nonGroupedZones
    }))
  }
