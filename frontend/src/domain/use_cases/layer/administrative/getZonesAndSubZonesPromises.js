import { LayerProperties, LayerType } from '../../../entities/layers/constants'
import { getAdministrativeSubZonesFromAPI } from '../../../../api/geoserver'

export const getZonesAndSubZonesPromises = () => (dispatch, getState) => {
  return Object.keys(LayerProperties)
    .map(layer => LayerProperties[layer])
    .filter(layer => layer.type === LayerType.ADMINISTRATIVE)
    .filter(layer => layer.isIntersectable)
    .map(zone => {
      if (zone.hasSearchableZones) {
        return getAdministrativeSubZonesFromAPI(zone.code, getState().global.isBackoffice).then(subZonesFeatures => {
          return subZonesFeatures.features.map(subZone => {
            return {
              group: zone.name,
              groupCode: zone.code,
              label: subZone.properties[zone.subZoneFieldKey] ? subZone.properties[zone.subZoneFieldKey].toString() : 'Aucun nom',
              name: subZone.properties[zone.subZoneFieldKey] ? subZone.properties[zone.subZoneFieldKey] : 'Aucun nom',
              code: subZone.id,
              value: subZone.id,
              isSubZone: true
            }
          })
        }).catch(error => {
          console.warn(error)
        })
      }

      const nextZone = { ...zone }

      nextZone.label = zone.name
      nextZone.value = zone.code
      nextZone.group = zone.group ? zone.group.name : 'Administratives'

      return nextZone
    })
}
