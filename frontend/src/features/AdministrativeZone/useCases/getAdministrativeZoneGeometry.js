import { getAdministrativeZoneFromAPI } from '../../../api/geoserver'
import layer from '../../../domain/shared_slices/Layer'
import { addZoneSelected } from '../../VesselList/slice'

const getAdministrativeZoneGeometry =
  (administrativeZoneCode, subZoneCode, zoneName, namespace) => (dispatch, getState) => {
    const { addAdministrativeZoneGeometryToCache } = layer[namespace].actions
    const geometryCache = getState().layer.administrativeZonesGeometryCache
    const foundCache = geometryCache.find(zone => zone.key === `${administrativeZoneCode}:${subZoneCode}:${zoneName}`)
    if (foundCache) {
      dispatchZoneSelected(foundCache.value)
    }

    getAdministrativeZoneFromAPI(administrativeZoneCode, null, subZoneCode, getState().mainWindow.isBackoffice)
      .then(administrativeZoneFeature => {
        if (administrativeZoneFeature.numberReturned === 1) {
          dispatchZoneSelected(administrativeZoneFeature)
          dispatch(
            addAdministrativeZoneGeometryToCache({
              key: `${administrativeZoneCode}:${subZoneCode}:${zoneName}`,
              value: administrativeZoneFeature
            })
          )
        } else {
          console.error(`Vector ${administrativeZoneFeature}:${subZoneCode} has
        ${administrativeZoneFeature.numberReturned} features. It should have only 1 feature.`)
        }
      })
      .catch(e => {
        console.warn(e.error)
      })

    function dispatchZoneSelected(feature) {
      dispatch(
        addZoneSelected({
          code: subZoneCode || administrativeZoneCode,
          feature,
          name: zoneName
        })
      )
    }
  }

export default getAdministrativeZoneGeometry
