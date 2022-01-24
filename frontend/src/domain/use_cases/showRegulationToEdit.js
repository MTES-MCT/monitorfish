import { getRegulatoryZoneFromAPI, REGULATORY_ZONE_METADATA_ERROR_MESSAGE } from '../../api/fetch'
import { mapToRegulatoryZone, DEFAULT_REGULATORY_TEXT } from '../entities/regulatory'
import { setError } from '../shared_slices/Global'
import { setRegulation } from '../../features/backoffice/Regulation.slice'
import Layers from '../entities/layers'

const showRegulationToEdit = regulatoryZone => async (dispatch, getState) => {
  return getRegulatoryZoneFromAPI(Layers.REGULATORY.code, regulatoryZone, getState().global.inBackofficeMode)
    .then(feature => {
      const regulatoryZoneMetadata = mapToRegulatoryZone(feature)

      const {
        lawType,
        topic,
        zone,
        region,
        regulatoryReferences,
        id,
        upcomingRegulatoryReferences,
        fishingPeriod,
        regulatorySpecies,
        regulatoryGears
      } = regulatoryZoneMetadata

      dispatch(setRegulation({
        lawType,
        topic,
        zone,
        region: region ? region.split(', ') : [],
        id,
        regulatoryReferences: regulatoryReferences?.length > 0 ? regulatoryReferences : [DEFAULT_REGULATORY_TEXT],
        upcomingRegulatoryReferences: upcomingRegulatoryReferences || { regulatoryTextList: [] },
        fishingPeriod,
        regulatorySpecies,
        regulatoryGears
      }))
    }).catch(error => {
      console.error(error)
      dispatch(setError(new Error(REGULATORY_ZONE_METADATA_ERROR_MESSAGE)))
    })
}

export default showRegulationToEdit
