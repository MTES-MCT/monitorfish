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
  (
    partialRegulatoryZone: Pick<RegulatoryZone, 'topic' | 'zone'>,
    isPreviewing: boolean = false
  ): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    dispatch(setLoadingRegulatoryZoneMetadata())
    const { speciesByCode } = getState().species

    try {
      const feature = await getRegulatoryFeatureMetadataFromAPI(partialRegulatoryZone, getState().global.isBackoffice)

      const parsedRegulatoryZone = mapToRegulatoryZone(feature, speciesByCode)
      if (!parsedRegulatoryZone) {
        throw new Error('`parsedRegulatoryZone` is undefined.')
      }

      dispatch(setRegulatoryZoneMetadata(parsedRegulatoryZone))

      if (isPreviewing) {
        dispatch(setRegulatoryGeometriesToPreview([parsedRegulatoryZone]))
      }
    } catch (err) {
      dispatch(closeRegulatoryZoneMetadataPanel())
      dispatch(setError(err))
      dispatch(resetLoadingRegulatoryZoneMetadata())
      dispatch(resetRegulatoryGeometriesToPreview())
    }
  }
