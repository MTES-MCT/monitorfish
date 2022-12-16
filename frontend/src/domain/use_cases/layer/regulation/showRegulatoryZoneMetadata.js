import {
  closeRegulatoryZoneMetadataPanel,
  resetLoadingRegulatoryZoneMetadata, resetRegulatoryGeometriesToPreview,
  setLoadingRegulatoryZoneMetadata, setRegulatoryGeometriesToPreview,
  setRegulatoryZoneMetadata
} from '../../../shared_slices/Regulatory'
import { mapToRegulatoryZone } from '../../../entities/regulation'
import { setError } from '../../../shared_slices/Global'
import { batch } from 'react-redux'
import { getRegulatoryFeatureMetadataFromAPI } from '../../../../api/geoserver'

const showRegulatoryZoneMetadata = (regulatoryZone, previewZone) => (dispatch, getState) => {
  if (regulatoryZone) {
    dispatch(setLoadingRegulatoryZoneMetadata())
    const speciesByCode = getState().species.speciesByCode
    getRegulatoryFeatureMetadataFromAPI(regulatoryZone, getState().global.isBackoffice).then(feature => {
      const regulatoryZoneMetadata = mapToRegulatoryZone(feature, speciesByCode)
      dispatch(setRegulatoryZoneMetadata(regulatoryZoneMetadata))

      if (previewZone) {
        dispatch(setRegulatoryGeometriesToPreview([feature.geometry]))
      }
    }).catch(error => {
      console.error(error)
      batch(() => {
        dispatch(closeRegulatoryZoneMetadataPanel())
        dispatch(setError(error))
        dispatch(resetLoadingRegulatoryZoneMetadata())
        dispatch(resetRegulatoryGeometriesToPreview())
      })
    })
  }
}

export default showRegulatoryZoneMetadata
