import LayersEnum, { layersType } from '../entities/layers'
import { getAdministrativeSubZonesFromAPI } from '../../api/fetch'

const getAdministrativeZonesAndSubZones = administrativeZones => async () => {
  let nextZones = []

  nextZones = administrativeZones
    .filter(layer => !layer.showMultipleZonesInAdministrativeZones)
    .filter(zone => !zone.group)
    .map(zone => [zone])

  const groups = [...new Set(administrativeZones
    .filter(zone => zone.group)
    .filter(layer => !layer.showMultipleZonesInAdministrativeZones)
    .map(zone => zone.group))]

  groups.forEach(group => {
    nextZones.push(administrativeZones
      .filter(zone => zone.group && zone.group === group))
  })

  const nextSubZonesPromises = Object.keys(LayersEnum)
    .map(layerName => LayersEnum[layerName])
    .filter(layer => layer.type === layersType.ADMINISTRATIVE)
    .filter(layer => layer.showMultipleZonesInAdministrativeZones)
    .map(zone => {
      if (zone.containsMultipleZones) {
        return getAdministrativeSubZonesFromAPI(zone.code).then(subZonesFeatures => {
          return subZonesFeatures.features.map(subZone => {
            return {
              group: zone.group,
              groupCode: zone.code,
              name: subZone.properties[zone.subZoneFieldKey] ? subZone.properties[zone.subZoneFieldKey].replace(/[_]/g, ' ') : 'Aucun nom',
              code: subZone.id,
              showMultipleZonesInAdministrativeZones: zone.showMultipleZonesInAdministrativeZones,
              isSubZone: true
            }
          })
        }).catch(error => {
          console.error(error)
        })
      }

      const nextSubZone = { ...zone }

      nextSubZone.group = zone.group ? zone.group.name : 'Administratives'

      return nextSubZone
    })

  return Promise.all(nextSubZonesPromises).then((nextSubZones) => {
    const nextSubZonesWithoutNulls = nextSubZones.flat().filter(zone => zone)

    const groups = [...new Set(nextSubZonesWithoutNulls.map(zone => zone.group))]

    groups.forEach(group => {
      nextZones.push(nextSubZonesWithoutNulls.filter(zone => zone.group === group))
    })

    return nextZones
  })
}

export default getAdministrativeZonesAndSubZones
