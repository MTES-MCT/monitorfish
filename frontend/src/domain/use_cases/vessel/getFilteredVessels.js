import GeoJSON from 'ol/format/GeoJSON'
import VectorSource from 'ol/source/Vector'

import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../entities/map'

const vectorSource = new VectorSource({
  format: new GeoJSON({
    dataProjection: WSG84_PROJECTION,
    featureProjection: OPENLAYERS_PROJECTION,
  }),
})

const getFilteredVessels = (vessels, filters) => async (dispatch, getState) => {
  const monitorFishWorker = await new MonitorFishWorker()
  const workerFilters = getFiltersWithoutZonesSelected(filters)

  return monitorFishWorker.getFilteredVessels(vessels, workerFilters).then(filteredVessels => {
    if (filters.zonesSelected?.length) {
      filteredVessels = filterByZones(filteredVessels, filters.zonesSelected)
    }

    return filteredVessels
  })
}

function getFiltersWithoutZonesSelected(filters) {
  const workerFilters = { ...filters }
  workerFilters.zonesSelected = null

  return workerFilters
}

function filterByZones(filteredVessels, zonesSelected) {
  const featuresGeometries = zonesSelected
    .map(zone => zone.feature)
    .map(feature => vectorSource.getFormat().readFeatures(feature))

  if (featuresGeometries && featuresGeometries.length) {
    const flattenFeaturesGeometries = featuresGeometries.flat().map(feature => feature.getGeometry())

    filteredVessels = filteredVessels.filter(
      vessel =>
        vessel.coordinates &&
        flattenFeaturesGeometries.some(featureGeometry => featureGeometry.intersectsCoordinate(vessel.coordinates)),
    )
  }

  return filteredVessels
}

export default getFilteredVessels
