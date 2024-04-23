import Fuse from 'fuse.js'

import { getRegulatoryZonesInExtentFromAPI } from '../../../api/geoserver'
import { getExtentFromGeoJSON } from '../../../utils'
import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'
import { REGULATION_SEARCH_OPTIONS } from '../components/RegulationSearch/constants'

import type { RegulatoryLawTypes, RegulatoryZone } from '../types'
import type { MainAppThunk } from '@store'

export const MINIMUM_SEARCH_CHARACTERS_NUMBER = 2

/**
 * Search for regulatory zones in the regulatory referential, by zone (geometry) and by the input filters
 */
export const searchRegulatoryLayers =
  (searchQuery: string | undefined): MainAppThunk =>
  async (_, getState): Promise<RegulatoryLawTypes | undefined> => {
    const monitorFishWorker = await MonitorFishWorker

    const { regulatoryZones } = getState().regulatory
    const { zoneSelected } = getState().regulatoryLayerSearch
    const { speciesByCode } = getState().species

    if (zoneSelected) {
      const extent = getExtentFromGeoJSON(zoneSelected.feature)

      if (extent?.length === 4) {
        return getRegulatoryZonesInExtentFromAPI(extent, getState().mainWindow.isBackoffice)
          .then(features => monitorFishWorker.mapGeoserverToRegulatoryZones(features, speciesByCode))
          .then(filteredRegulatoryZones => {
            if (!searchQuery || searchQuery.length < MINIMUM_SEARCH_CHARACTERS_NUMBER) {
              return monitorFishWorker.getStructuredRegulationLawTypes(filteredRegulatoryZones)
            }

            const fuse = new Fuse(filteredRegulatoryZones, REGULATION_SEARCH_OPTIONS)
            const items = fuse.search<RegulatoryZone>(searchQuery).map(result => result.item)

            return monitorFishWorker.getStructuredRegulationLawTypes(items)
          })
      }
    }

    if (!searchQuery || searchQuery.length < MINIMUM_SEARCH_CHARACTERS_NUMBER) {
      return Promise.resolve({})
    }

    const fuse = new Fuse(regulatoryZones, REGULATION_SEARCH_OPTIONS)
    const items = fuse.search<RegulatoryZone>(searchQuery).map(result => result.item)

    return monitorFishWorker.getStructuredRegulationLawTypes(items)
  }
