import { batch } from 'react-redux'

import { getRegulatoryFeatureMetadataFromAPI } from '../../../../api/geoserver'
import { mapToRegulatoryZone } from '../../../entities/regulation'
import { setError } from '../../../shared_slices/Global'
import {
  closeRegulatoryZoneMetadataPanel,
  resetLoadingRegulatoryZoneMetadata,
  resetRegulatoryGeometriesToPreview,
  setLoadingRegulatoryZoneMetadata,
  setRegulatoryGeometriesToPreview,
  setRegulatoryZoneMetadata
} from '../../../shared_slices/Regulatory'

import type { MainAppThunk } from '../../../../store'
import type { BaseRegulatoryZone } from '../../../types/regulation'

export const showRegulatoryZoneMetadata =
  (regulatoryZoneRequest: BaseRegulatoryZone, isPreviewing: boolean): MainAppThunk =>
  (dispatch, getState) => {
    if (!regulatoryZoneRequest) {
      return
    }

    dispatch(setLoadingRegulatoryZoneMetadata())
    const { speciesByCode } = getState().species

    getRegulatoryFeatureMetadataFromAPI(regulatoryZoneRequest, getState().global.isBackoffice)
      .then(feature => {
        const parsedRegulatoryZone = mapToRegulatoryZone(feature, speciesByCode)
        dispatch(setRegulatoryZoneMetadata(parsedRegulatoryZone))

        if (isPreviewing) {
          dispatch(setRegulatoryGeometriesToPreview([parsedRegulatoryZone]))
        }
      })
      .catch(error => {
        batch(() => {
          dispatch(closeRegulatoryZoneMetadataPanel())
          dispatch(setError(error))
          dispatch(resetLoadingRegulatoryZoneMetadata())
          dispatch(resetRegulatoryGeometriesToPreview())
        })
      })
  }
