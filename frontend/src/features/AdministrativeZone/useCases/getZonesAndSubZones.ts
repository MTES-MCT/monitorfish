import { isNotNullish } from '@utils/isNotNullish'

import { getAdministrativeSubZonesFromAPI } from '../../../api/geoserver'
import { LayerProperties, LayerType } from '../../MainMap/constants'

import type { MainMap } from '@features/MainMap/MainMap.types'
import type { ZoneChildren } from '@features/Vessel/components/VesselList/slice'
import type { MainAppThunk } from '@store'

// TODO This could be transformed into a function or an RTK call, there is no need for a thunk here.
export const getZonesAndSubZones = (): MainAppThunk<Promise<Array<ZoneChildren>>> => async () => {
  const filteredLayers = Object.keys(LayerProperties)
    .map<MainMap.ShowableLayer>(layerKey => LayerProperties[layerKey])
    .filter(layer => layer.type === LayerType.ADMINISTRATIVE)
    .filter(layer => layer.isIntersectable)

  const zonesAndSubZones = await Promise.all(
    filteredLayers.map(async (zone): Promise<ZoneChildren | ZoneChildren[] | undefined> => {
      if (zone.hasSearchableZones) {
        try {
          const subZonesFeatures = await getAdministrativeSubZonesFromAPI(zone.code, false)

          return subZonesFeatures.features.map((subZone: any) => ({
            code: subZone.id,
            group: zone.name ?? 'Aucun groupe',
            groupCode: zone.code,
            isSubZone: true,
            label:
              zone.zoneNamePropertyKey && subZone.properties[zone.zoneNamePropertyKey]
                ? subZone.properties[zone.zoneNamePropertyKey].toString()
                : 'Aucun nom',
            name:
              zone.zoneNamePropertyKey && subZone.properties[zone.zoneNamePropertyKey]
                ? subZone.properties[zone.zoneNamePropertyKey]
                : 'Aucun nom',
            value: subZone.id
          }))
        } catch (error) {
          console.warn(error)

          return undefined
        }
      }

      // Default values here have been added to match the `ZoneChildren` type after TS migration. They may be useless.
      return {
        ...zone,
        group: zone.group ? zone.group.name : 'Administratives',
        groupCode: 'Aucun code',
        isSubZone: false,
        label: zone.name ?? 'Aucun nom',
        name: zone.name ?? 'Aucun nom',
        value: zone.code
      }
    })
  )

  return zonesAndSubZones.flat().filter(isNotNullish)
}
