import { getAdministrativeSubZonesFromAPI } from '../../api/fetch'
import Layers, { layersType } from '../entities/layers'

export const getZonesAndSubZonesPromises = () => (dispatch, getState) => {
  return Object.keys(Layers)
    .map(layer => Layers[layer])
    .filter(layer => layer.type === layersType.ADMINISTRATIVE)
    .filter(layer => layer.isIntersectable)
    .map(zone => {
      if (zone.containsMultipleZones) {
        return getAdministrativeSubZonesFromAPI(zone.code, getState().global.inBackofficeMode).then(subZonesFeatures => {
          return subZonesFeatures.features.map(subZone => {
            return {
              group: zone.name,
              groupCode: zone.code,
              label: subZone.properties[zone.subZoneFieldKey] ? subZone.properties[zone.subZoneFieldKey] : 'Aucun nom',
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
