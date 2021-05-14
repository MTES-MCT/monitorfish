import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../../workers/MapperWorker'

const worker = new Worker()
const MapperWorker = Comlink.wrap(worker)

const getFilteredVessels = (vessels, filters) => async () => {
  const worker = await new MapperWorker()

  const workerFilters = getFiltersWithoutZonesSelected(filters)

  return worker.getFilteredVessels(vessels, workerFilters).then(filteredVessels => {
    if (filters.zonesSelected && filters.zonesSelected.length) {
      filteredVessels = filterByZones(filteredVessels, filters.zonesSelected)
    }

    return filteredVessels
  })
}

function getFiltersWithoutZonesSelected (filters) {
  const workerFilters = { ...filters }
  workerFilters.zonesSelected = null
  return workerFilters
}

function filterByZones (filteredVessels, zonesSelected) {
  filteredVessels = filteredVessels.filter(vessel => {
    return zonesSelected.some(zoneSelected => zoneSelected.feature.getGeometry()
      .intersectsCoordinate(vessel.olCoordinates))
  }).filter((zone, index, acc) => acc
    .findIndex(existingZone => (existingZone.id === zone.id)) === index)
  return filteredVessels
}

export default getFilteredVessels
