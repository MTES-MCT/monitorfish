import { setError } from '@features/MainWindow/slice'

import { getRegulatoryZoneFromAPI, REGULATORY_ZONE_METADATA_ERROR_MESSAGE } from '../../../api/geoserver'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { STATUS } from '../../BackOffice/constants'
import { setProcessingRegulation, setSelectedRegulatoryZoneId, setStatus } from '../../BackOffice/slice'
import { mapToRegulatoryZone, DEFAULT_REGULATORY_TEXT } from '../utils'

const showRegulationToEdit = regulatoryZone => async (dispatch, getState) => {
  const { speciesByCode } = getState().species
  dispatch(setStatus(STATUS.LOADING))

  return getRegulatoryZoneFromAPI(LayerProperties.REGULATORY.code, regulatoryZone, getState().mainWindow.isBackoffice)
    .then(feature => {
      const regulatoryZoneMetadata = mapToRegulatoryZone(feature, speciesByCode)

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
        setProcessingRegulation({
          fishingPeriod,
          gearRegulation,
          geometry,
          id,
          lawType,
          otherInfo,
          region: region ? region.split(', ') : [],
          regulatoryReferences: regulatoryReferences?.length > 0 ? regulatoryReferences : [DEFAULT_REGULATORY_TEXT],
          speciesRegulation,
          topic,
          zone
        })
      )
      dispatch(setSelectedRegulatoryZoneId(id))
    })
    .catch(error => {
      console.error(error)
      dispatch(setError(new Error(REGULATORY_ZONE_METADATA_ERROR_MESSAGE)))
    })
}

export default showRegulationToEdit
