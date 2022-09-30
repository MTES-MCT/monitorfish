import { getRegulatoryZoneFromAPI, REGULATORY_ZONE_METADATA_ERROR_MESSAGE } from '../../../../api/geoserver'
import { STATUS } from '../../../../features/backoffice/constants'
import {
  setProcessingRegulation,
  setSelectedRegulatoryZoneId,
  setStatus
} from '../../../../features/backoffice/Regulation.slice'
import Layers from '../../../entities/layers'
import { mapToRegulatoryZone, DEFAULT_REGULATORY_TEXT } from '../../../entities/regulatory'
import { setError } from '../../../shared_slices/Global'

const showRegulationToEdit = regulatoryZone => async (dispatch, getState) => {
  const { speciesByCode } = getState().species
  dispatch(setStatus(STATUS.LOADING))

  return getRegulatoryZoneFromAPI(Layers.REGULATORY.code, regulatoryZone, getState().global.isBackoffice)
    .then(feature => {
      const regulatoryZoneMetadata = mapToRegulatoryZone(feature, speciesByCode)

      const {
        fishingPeriod,
        gearRegulation,
        geometry,
        id,
        lawType,
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
