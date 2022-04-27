import { getExtentFromGeoJSON } from '../../../../utils'
import { getRegulatoryLayersWithoutTerritory } from '../../../entities/regulatory'
import { getRegulatoryZonesInExtentFromAPI } from '../../../../api/geoserver'
import { MonitorFishWorker } from '../../../../workers/MonitorFishWorker'

/**
 * Search for regulatory zones in the regulatory referential, by zone (geometry) and by the input filters
 * @function searchRegulatoryLayers
 * @param {Object} searchFields
 * @param {boolean} inputsAreEmpty
 * @return {Object} - Return the found regulatory zones
 */
const searchRegulatoryLayers = (searchFields, inputsAreEmpty) => {
  return async (dispatch, getState) => {
    const monitorFishWorker = await new MonitorFishWorker()

    const state = getState()
    const {
      regulatoryLayerLawTypes
    } = state.regulatory
    const {
      zoneSelected
    } = state.regulatoryLayerSearch
    const {
      gears
    } = state.gear
    const {
      species,
      speciesByCode
    } = state.species

    let extent = []
    if (zoneSelected) {
      extent = getExtentFromGeoJSON(zoneSelected.feature)
    }

    if (extent?.length === 4) {
      return getRegulatoryZonesInExtentFromAPI(extent, state.global.inBackofficeMode)
        .then(features => monitorFishWorker.convertGeoJSONFeaturesToStructuredRegulatoryObject(features, speciesByCode))
        .then(result => getRegulatoryLayersWithoutTerritory(result.layersTopicsByRegulatoryTerritory))
        .then(filteredRegulatoryLayers => {
          if (inputsAreEmpty) {
            return filteredRegulatoryLayers
          }

          return monitorFishWorker.searchLayers(searchFields, filteredRegulatoryLayers, gears, species)
        })
    }

    return monitorFishWorker.searchLayers(searchFields, regulatoryLayerLawTypes, gears, species)
  }
}

export default searchRegulatoryLayers
