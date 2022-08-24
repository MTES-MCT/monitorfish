import { getAdministrativeSubZonesFromAPI } from '../../../../api/geoserver'
import Layers, { layersType } from '../../../entities/layers'

export const getZonesAndSubZonesPromises = () => (dispatch, getState) =>
  Object.keys(Layers)
    .map(layer => Layers[layer])
    .filter(layer => layer.type === layersType.ADMINISTRATIVE)
    .filter(layer => layer.isIntersectable)
    .map(zone => {
      if (zone.containsMultipleZones) {
        return getAdministrativeSubZonesFromAPI(zone.code, getState().global.inBackofficeMode)
          .then(subZonesFeatures =>
            subZonesFeatures.features.map(subZone => ({
              code: subZone.id,
              group: zone.name,
              groupCode: zone.code,
              isSubZone: true,
              label: subZone.properties[zone.subZoneFieldKey]
                ? subZone.properties[zone.subZoneFieldKey].toString()
                : 'Aucun nom',
              name: subZone.properties[zone.subZoneFieldKey] ? subZone.properties[zone.subZoneFieldKey] : 'Aucun nom',
              value: subZone.id,
            })),
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
