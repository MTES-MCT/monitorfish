import { getAdministrativeZoneFromAPI } from '../../api/fetch'
import { addZoneSelected } from '../reducers/Map'
// import { addAdministrativeZoneGeometryToCache } from '../reducers/Layer'
import layer from '../reducers/Layer'

const getAdministrativeZoneGeometry = (administrativeZoneCode, subZoneCode, zoneName, namespace) => (dispatch, getState) => {
  const { addAdministrativeZoneGeometryToCache } = layer[namespace].actions
  const geometryCache = getState().layer.administrativeZonesGeometryCache
  const foundCache = geometryCache.find(zone => zone.key === `${administrativeZoneCode}:${subZoneCode}:${zoneName}`)
  if (foundCache) {
    dispatchZoneSelected(foundCache.value)
  }

  getAdministrativeZoneFromAPI(administrativeZoneCode, null, subZoneCode).then(administrativeZoneFeature => {
    if (administrativeZoneFeature.numberReturned === 1) {
      dispatchZoneSelected(administrativeZoneFeature)
      dispatch(addAdministrativeZoneGeometryToCache({
        key: `${administrativeZoneCode}:${subZoneCode}:${zoneName}`,
        value: administrativeZoneFeature
      }))
    } else {
      console.error(`Vector ${administrativeZoneFeature}:${subZoneCode} has 
        ${administrativeZoneFeature.numberReturned} features. It should have only 1 feature.`)
    }
  }).catch(e => {
    console.warn(e.error)
  })

  function dispatchZoneSelected (feature) {
    dispatch(addZoneSelected({
      name: zoneName,
      code: subZoneCode || administrativeZoneCode,
      feature: feature
    }))
  }
}

export default getAdministrativeZoneGeometry
