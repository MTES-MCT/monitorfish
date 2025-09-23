import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { LayerProperties } from '@features/Map/constants'
import { Level } from '@mtes-mct/monitor-ui'

import { getRegulatoryZoneFromAPI, REGULATORY_ZONE_METADATA_ERROR_MESSAGE } from '../../../api/geoserver'
import { STATUS } from '../components/RegulationTables/constants'
import { regulationActions } from '../slice'
import { mapToRegulatoryZone, DEFAULT_REGULATORY_TEXT } from '../utils'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type { MainAppThunk } from '@store'

export const showRegulationToEdit =
  (regulatoryZone: MonitorFishMap.ShowedLayer): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { speciesByCode } = getState().species
    dispatch(regulationActions.setStatus(STATUS.LOADING))

    try {
      const feature = await getRegulatoryZoneFromAPI(
        LayerProperties.REGULATORY.code,
        regulatoryZone,
        getState().global.isBackoffice
      )

      const regulatoryZoneMetadata = mapToRegulatoryZone(feature, speciesByCode)
      if (!regulatoryZoneMetadata) {
        throw new Error('`regulatoryZoneMetadata` is undefined')
      }

      const {
        fishingPeriod,
        gearRegulation,
        geometry,
        id,
        lawType,
        otherInfo,
        region,
        regulatoryReferences,
        speciesRegulation,
        topic,
        zone
      } = regulatoryZoneMetadata

      dispatch(
        regulationActions.setProcessingRegulation({
          fishingPeriod,
          gearRegulation,
          geometry,
          id,
          lawType,
          nextId: undefined,
          otherInfo,
          region: region ? region.split(', ') : [],
          regulatoryReferences: regulatoryReferences?.length ? regulatoryReferences : [DEFAULT_REGULATORY_TEXT],
          speciesRegulation,
          topic,
          zone
        })
      )
      dispatch(regulationActions.setSelectedRegulatoryZoneId(id))
    } catch (err) {
      console.error(err)
      dispatch(
        addMainWindowBanner({
          children: REGULATORY_ZONE_METADATA_ERROR_MESSAGE,
          closingDelay: 3000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }
