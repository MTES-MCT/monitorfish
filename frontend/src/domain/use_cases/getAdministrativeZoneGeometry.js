import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../entities/map'
import { getAdministrativeZoneFromAPI } from '../../api/fetch'
import { all } from 'ol/loadingstrategy'
import { addZoneSelected } from '../reducers/Map'
import { addAdministrativeZoneGeometryToCache } from '../reducers/Layer'

const IRRETRIEVABLE_FEATURES_EVENT = 'IRRETRIEVABLE_FEATURES'

const setIrretrievableFeaturesEvent = error => {
  return {
    type: IRRETRIEVABLE_FEATURES_EVENT,
    error: error
  }
}

const getAdministrativeZoneGeometry = (administrativeZoneCode, subZoneCode, zoneName) => (dispatch, getState) => {
  const geometryCache = getState().layer.administrativeZonesGeometryCache
  let foundCache = geometryCache.find(zone => zone.key === `${administrativeZoneCode}:${subZoneCode}:${zoneName}`)
  if(foundCache) {
    dispatchZoneSelected(foundCache.value)
  }

  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    strategy: all
  })

  getAdministrativeZoneFromAPI(administrativeZoneCode, null, subZoneCode).then(administrativeZoneFeature => {
    vectorSource.addFeatures(vectorSource.getFormat().readFeatures(administrativeZoneFeature))
    if (vectorSource.getFeatures().length === 1 && vectorSource.getFeatures()[0]) {
      dispatchZoneSelected(vectorSource.getFeatures()[0])
      dispatch(addAdministrativeZoneGeometryToCache({
        key: `${administrativeZoneCode}:${subZoneCode}:${zoneName}`,
        value: vectorSource.getFeatures()[0]
      }))
    } else {
      console.error(`Vector ${administrativeZoneFeature}:${subZoneCode} has ${vectorSource.getFeatures().length} features. It should have only one feature.`)
    }
  }).catch(e => {
    vectorSource.dispatchEvent(setIrretrievableFeaturesEvent(e))
  })

  vectorSource.once(IRRETRIEVABLE_FEATURES_EVENT, event => {
    console.warn(event.error)
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
