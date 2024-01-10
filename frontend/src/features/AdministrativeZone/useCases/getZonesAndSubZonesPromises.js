import { getAdministrativeSubZonesFromAPI } from '../../../api/geoserver'
import { LayerProperties, LayerType } from '../../../domain/entities/layers/constants'

export const getZonesAndSubZonesPromises = () => (dispatch, getState) =>
  Object.keys(LayerProperties)
    .map(layer => LayerProperties[layer])
    .filter(layer => layer.type === LayerType.ADMINISTRATIVE)
    .filter(layer => layer.isIntersectable)
    .map(zone => {
      if (zone.hasSearchableZones) {
        return getAdministrativeSubZonesFromAPI(zone.code, getState().global.isBackoffice)
          .then(subZonesFeatures =>
            subZonesFeatures.features.map(subZone => ({
              code: subZone.id,
              group: zone.name,
              groupCode: zone.code,
              isSubZone: true,
              label: subZone.properties[zone.zoneNamePropertyKey]
                ? subZone.properties[zone.zoneNamePropertyKey].toString()
                : 'Aucun nom',
              name: subZone.properties[zone.zoneNamePropertyKey]
                ? subZone.properties[zone.zoneNamePropertyKey]
                : 'Aucun nom',
              value: subZone.id
            }))
          )
          .catch(error => {
            console.warn(error)
          })
      }

      const nextZone = { ...zone }

      nextZone.label = zone.name
      nextZone.value = zone.code
      nextZone.group = zone.group ? zone.group.name : 'Administratives'

      return nextZone
    })
