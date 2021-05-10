import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../../workers/MapperWorker'

const worker = new Worker()
const MapperWorker = Comlink.wrap(worker)

const getFilteredVessels = (vessels, countriesFiltered, lastPositionTimeAgoFilter, zonesSelected, fleetSegmentsFiltered, gearsFiltered) => async () => {
  const worker = await new MapperWorker()

  return worker.getFilteredVessels(vessels, countriesFiltered, lastPositionTimeAgoFilter, fleetSegmentsFiltered, gearsFiltered).then(filteredVessels => {
    if (zonesSelected && zonesSelected.length) {
      filteredVessels = filterByZones(filteredVessels, zonesSelected)
    }

    return filteredVessels
  })
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
