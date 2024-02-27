import Fuse from 'fuse.js'

import { getRegulatoryZonesInExtentFromAPI } from '../../../api/geoserver'
import { getExtentFromGeoJSON } from '../../../utils'
import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'
import { REGULATION_SEARCH_OPTIONS } from '../components/RegulationSearch/constants'

import type { RegulatoryZone } from '../types'

export const MINIMUM_SEARCH_CHARACTERS_NUMBER = 2

/**
 * Search for regulatory zones in the regulatory referential, by zone (geometry) and by the input filters
 */
export const searchRegulatoryLayers = searchQuery => async (_, getState) => {
  const monitorFishWorker = await MonitorFishWorker
  const state = getState()
  const { regulatoryZones } = state.regulatory
  const { zoneSelected } = state.regulatoryLayerSearch
  const { speciesByCode } = state.species

  if (zoneSelected) {
    const extent = getExtentFromGeoJSON(zoneSelected.feature)

    if (extent?.length === 4) {
      return getRegulatoryZonesInExtentFromAPI(extent, state.global.isBackoffice)
        .then(features => monitorFishWorker.mapGeoserverToRegulatoryZones(features, speciesByCode))
        .then(filteredRegulatoryZones => {
          if (searchQuery?.length < MINIMUM_SEARCH_CHARACTERS_NUMBER) {
            return monitorFishWorker.getStructuredRegulationLawTypes(filteredRegulatoryZones)
          }

          const fuse = new Fuse(filteredRegulatoryZones, REGULATION_SEARCH_OPTIONS)

          const items = fuse.search<RegulatoryZone>(searchQuery).map(result => result.item)

          return monitorFishWorker.getStructuredRegulationLawTypes(items)
        })
    }
  }

  const fuse = new Fuse(regulatoryZones, REGULATION_SEARCH_OPTIONS)

  const items = fuse.search<RegulatoryZone>(searchQuery).map(result => result.item)

  return monitorFishWorker.getStructuredRegulationLawTypes(items)
}
