import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../../workers/MonitorFishWorker'
import { getExtentFromGeoJSON } from '../../utils'
import { getRegulatoryZonesInExtentFromAPI } from '../../api/fetch'
import { getRegulatoryLayersWithoutTerritory } from '../entities/regulatory'

const worker = new Worker()
const MonitorFishWorker = Comlink.wrap(worker)

/**
 * Search for regulatory zones in the regulatory referential, by zone (geometry) and by the input filters
 * @function searchRegulatoryLayers
 * @param {Object} searchFields
 * @param {boolean} inputsAreEmpty
 * @return {Object} - Return the found regulatory zones
 */
const searchRegulatoryLayers = (searchFields, inputsAreEmpty) => {
  return async (dispatch, getState) => {
    const worker = await new MonitorFishWorker()
    const {
      regulatoryLayers
    } = getState().regulatory
    const {
      zoneSelected
    } = getState().regulatoryLayerSearch

    let extent = []
    if (zoneSelected) {
      extent = getExtentFromGeoJSON(zoneSelected.feature)
    }

    if (extent?.length === 4) {
      return getRegulatoryZonesInExtentFromAPI(extent, getState().global.inBackofficeMode)
        .then(features => worker.convertGeoJSONFeaturesToStructuredRegulatoryObject(features))
        .then(response => getRegulatoryLayersWithoutTerritory(response))
        .then(filteredRegulatoryLayers => {
          if (inputsAreEmpty) {
            return filteredRegulatoryLayers
          }

          return worker.searchLayers(searchFields, filteredRegulatoryLayers, getState().gear.gears)
        })
    }

    return worker.searchLayers(searchFields, regulatoryLayers, getState().gear.gears)
  }
}

export default searchRegulatoryLayers
