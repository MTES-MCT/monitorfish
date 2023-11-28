import { getRegulatoryFeatureMetadataFromAPI } from '../../../api/geoserver'
import { setError } from '../../../domain/shared_slices/Global'
import {
  closeRegulatoryZoneMetadataPanel,
  resetLoadingRegulatoryZoneMetadata,
  resetRegulatoryGeometriesToPreview,
  setLoadingRegulatoryZoneMetadata,
  setRegulatoryGeometriesToPreview,
  setRegulatoryZoneMetadata
} from '../slice'
import { mapToRegulatoryZone } from '../utils'

import type { MainAppThunk } from '../../../store'
import type { RegulatoryZone } from '../types'

export const showRegulatoryZoneMetadata =
  (partialRegulatoryZone: Pick<RegulatoryZone, 'topic' | 'zone'>, isPreviewing: boolean = false): MainAppThunk =>
  (dispatch, getState) => {
    dispatch(setLoadingRegulatoryZoneMetadata())
    const { speciesByCode } = getState().species

    getRegulatoryFeatureMetadataFromAPI(partialRegulatoryZone, getState().global.isBackoffice)
      .then(feature => {
        const parsedRegulatoryZone = mapToRegulatoryZone(feature, speciesByCode)
        dispatch(setRegulatoryZoneMetadata(parsedRegulatoryZone))

        if (isPreviewing) {
          dispatch(setRegulatoryGeometriesToPreview([parsedRegulatoryZone]))
        }
      })
      .catch(error => {
        dispatch(closeRegulatoryZoneMetadataPanel())
        dispatch(setError(error))
        dispatch(resetLoadingRegulatoryZoneMetadata())
        dispatch(resetRegulatoryGeometriesToPreview())
      })
  }
