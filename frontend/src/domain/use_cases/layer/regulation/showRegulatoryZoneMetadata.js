import { batch } from 'react-redux'

import { getRegulatoryFeatureMetadataFromAPI } from '../../../../api/geoserver'
import { mapToRegulatoryZone } from '../../../entities/regulatory'
import { setError } from '../../../shared_slices/Global'
import {
  closeRegulatoryZoneMetadataPanel,
  resetLoadingRegulatoryZoneMetadata,
  resetRegulatoryGeometriesToPreview,
  setLoadingRegulatoryZoneMetadata,
  setRegulatoryGeometriesToPreview,
  setRegulatoryZoneMetadata
} from '../../../shared_slices/Regulatory'

const showRegulatoryZoneMetadata = (regulatoryZone, previewZone) => (dispatch, getState) => {
  if (regulatoryZone) {
    dispatch(setLoadingRegulatoryZoneMetadata())
    const { speciesByCode } = getState().species
    getRegulatoryFeatureMetadataFromAPI(regulatoryZone, getState().global.isBackoffice)
      .then(feature => {
        const regulatoryZoneMetadata = mapToRegulatoryZone(feature, speciesByCode)
        dispatch(setRegulatoryZoneMetadata(regulatoryZoneMetadata))

        if (previewZone) {
          dispatch(setRegulatoryGeometriesToPreview([feature.geometry]))
        }
      })
      .catch(error => {
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
