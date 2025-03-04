import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@features/Map/constants'
import GeoJSON from 'ol/format/GeoJSON'
import VectorSource from 'ol/source/Vector'

import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'

import type { Vessel } from '@features/Vessel/Vessel.types'

const vectorSource = new VectorSource({
  format: new GeoJSON({
    dataProjection: WSG84_PROJECTION,
    featureProjection: OPENLAYERS_PROJECTION
  })
})

export const getFilteredVessels = (vessels: Vessel.VesselLastPosition[], filters) => async () => {
  const monitorFishWorker = await MonitorFishWorker
  const workerFilters = getFiltersWithoutZonesSelected(filters)

  return monitorFishWorker
    .getFilteredVessels(vessels, workerFilters)
    .then(filteredVessels =>
      filters.zonesSelected?.length ? filterByZones(filteredVessels, filters.zonesSelected) : filteredVessels
    )
}

function getFiltersWithoutZonesSelected(filters) {
  const workerFilters = { ...filters }
  workerFilters.zonesSelected = null

  return workerFilters
}

function filterByZones(filteredVessels, zonesSelected) {
  const featuresGeometries = zonesSelected
    .map(zone => zone.feature)
    .map(feature => vectorSource.getFormat()?.readFeatures(feature))

  if (!featuresGeometries?.length) {
    return filteredVessels
  }

  const flattenFeaturesGeometries = featuresGeometries.flat().map(feature => feature.getGeometry())

  return filteredVessels.filter(
    vessel =>
      vessel.coordinates &&
      flattenFeaturesGeometries.some(featureGeometry => featureGeometry.intersectsCoordinate(vessel.coordinates))
  )
}
