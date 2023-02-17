import { mapToRegulatoryZone, DEFAULT_REGULATORY_TEXT } from '../../../entities/regulation'
import { setError } from '../../../shared_slices/Global'
import {
  setProcessingRegulation,
  setSelectedRegulatoryZoneId,
  setStatus
} from '../../../../features/Backoffice/Regulation.slice'
import { Layer } from '../../../entities/layers/constants'
import { getRegulatoryZoneFromAPI, REGULATORY_ZONE_METADATA_ERROR_MESSAGE } from '../../../../api/geoserver'
import { STATUS } from '../../../../features/Backoffice/constants'

const showRegulationToEdit = regulatoryZone => async (dispatch, getState) => {
  const { speciesByCode } = getState().species
  dispatch(setStatus(STATUS.LOADING))

  return getRegulatoryZoneFromAPI(Layer.REGULATORY.code, regulatoryZone, getState().global.isBackoffice)
    .then(feature => {
      const regulatoryZoneMetadata = mapToRegulatoryZone(feature, speciesByCode)

      const {
        lawType,
        topic,
        zone,
        region,
        regulatoryReferences,
        id,
        fishingPeriod,
        speciesRegulation,
        gearRegulation,
        geometry,
        otherInfo
      } = regulatoryZoneMetadata

      dispatch(
        setProcessingRegulation({
          lawType,
          topic,
          zone,
          region: region ? region.split(', ') : [],
          id,
          regulatoryReferences: regulatoryReferences?.length > 0 ? regulatoryReferences : [DEFAULT_REGULATORY_TEXT],
          fishingPeriod,
          speciesRegulation,
          gearRegulation,
          geometry,
          otherInfo
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
