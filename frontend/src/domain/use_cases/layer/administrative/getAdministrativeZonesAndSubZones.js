import { Layer as LayersEnum, LayerType } from '../../../entities/layers/constants'
import { getAdministrativeSubZonesFromAPI } from '../../../../api/geoserver'

const getAdministrativeZonesAndSubZones = administrativeZones => async (dispatch, getState) => {
  let nextZones = []

  nextZones = administrativeZones
    .filter(zone => !zone.showMultipleZonesInAdministrativeZones)
    .filter(zone => !zone.group)
    .map(zone => [zone])

  const groups = [...new Set(administrativeZones
    .filter(zone => zone.group)
    .filter(zone => !zone.showMultipleZonesInAdministrativeZones)
    .map(zone => zone.group))]

  groups.forEach(group => {
    nextZones.push(administrativeZones
      .filter(zone => zone.group && zone.group === group))
  })

  const nextSubZonesPromises = Object.keys(LayersEnum)
    .map(layer => LayersEnum[layer])
    .filter(zone => zone.type === LayerType.ADMINISTRATIVE)
    .filter(zone => zone.showMultipleZonesInAdministrativeZones)
    .map(zone => {
      if (zone.containsMultipleZones) {
        return getAdministrativeSubZonesFromAPI(zone.code, getState().global.isBackoffice).then(subZonesFeatures => {
          if (!subZonesFeatures) {
            return []
          }

          return subZonesFeatures.features.map(subZone => {
            return {
              group: zone.group,
              groupCode: zone.code,
              name: subZone.properties[zone.subZoneFieldKey] ? subZone.properties[zone.subZoneFieldKey] : 'Aucun nom',
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
