import { setRegulatoryZoneMetadata } from '../shared_slices/Regulatory'
import { getRegulatoryZoneFromAPI, REGULATORY_ZONE_METADATA_ERROR_MESSAGE } from '../../api/fetch'
import { mapToRegulatoryZone } from '../entities/regulatory'
import { setError } from '../shared_slices/Global'
import Layers from '../entities/layers'

const parseRegulatoryTexts = (regulatoryTexts) => {
  const parse = JSON.parse(regulatoryTexts)
  if (parse && parse.length > 0) {
    return parse.map((regulatoryText) => {
      const parsedRegulatoryText = { ...regulatoryText }
      if (!parsedRegulatoryText.startDate || parsedRegulatoryText.startDate === '') {
        parsedRegulatoryText.startDate = new Date().getTime()
      }
      return parsedRegulatoryText
    })
  }
  return undefined
}
const showRegulationToEdit = regulatoryZone => async (dispatch) => {
  return getRegulatoryZoneFromAPI(Layers.REGULATORY.code, regulatoryZone)
    .then(response => {
      const feature = response.features[0]
      const regulatoryZoneMetadata = mapToRegulatoryZone(feature.properties)
      const {
        regulatoryReferences,
        upcomingRegulatoryReferences
      } = regulatoryZoneMetadata
      const parsedReg = parseRegulatoryTexts(regulatoryReferences)
      regulatoryZoneMetadata.regulatoryReferences = parsedReg
      regulatoryZoneMetadata.upcomingRegulatoryReferences =
        upcomingRegulatoryReferences && upcomingRegulatoryReferences !== {}
          ? JSON.parse(upcomingRegulatoryReferences)
          : undefined
      regulatoryZoneMetadata.geometry = feature.geometry
      if (!regulatoryZoneMetadata.id) {
        regulatoryZoneMetadata.id = feature.id.split('.')[1]
      }
      dispatch(setRegulatoryZoneMetadata(regulatoryZoneMetadata))
    }).catch(error => {
      console.error(error)
      dispatch(setError(new Error(REGULATORY_ZONE_METADATA_ERROR_MESSAGE)))
    })
}

export default showRegulationToEdit
