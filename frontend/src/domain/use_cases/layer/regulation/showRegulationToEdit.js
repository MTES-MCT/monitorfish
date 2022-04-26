import { mapToRegulatoryZone, DEFAULT_REGULATORY_TEXT } from '../../../entities/regulatory'
import { setError } from '../../../shared_slices/Global'
import { setProcessingRegulation, setSelectedRegulatoryZoneId } from '../../../../features/backoffice/Regulation.slice'
import Layers from '../../../entities/layers'
import { getRegulatoryZoneFromAPI, REGULATORY_ZONE_METADATA_ERROR_MESSAGE } from '../../../../api/geoserver'

const showRegulationToEdit = regulatoryZone => async (dispatch, getState) => {
  const { speciesByCode } = getState().species

  return getRegulatoryZoneFromAPI(Layers.REGULATORY.code, regulatoryZone, getState().global.inBackofficeMode)
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
        regulatorySpecies,
        gearRegulation,
        geometry
      } = regulatoryZoneMetadata
      console.log(regulatoryZoneMetadata)

      dispatch(setProcessingRegulation({
        lawType,
        topic,
        zone,
        region: region ? region.split(', ') : [],
        id,
        regulatoryReferences: regulatoryReferences?.length > 0 ? regulatoryReferences : [DEFAULT_REGULATORY_TEXT],
        fishingPeriod,
        regulatorySpecies,
        gearRegulation,
        geometry
      }))
      dispatch(setSelectedRegulatoryZoneId(id))
    }).catch(error => {
      console.error(error)
      dispatch(setError(new Error(REGULATORY_ZONE_METADATA_ERROR_MESSAGE)))
    })
}

export default showRegulationToEdit
