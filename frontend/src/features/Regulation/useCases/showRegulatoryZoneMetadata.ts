import { getRegulatoryFeatureMetadataFromAPI } from '../../../api/geoserver'
import { setError } from '../../../domain/shared_slices/Global'
import { regulationActions } from '../slice'
import { mapToRegulatoryZone } from '../utils'

import type { MainAppThunk } from '../../../store'
import type { RegulatoryZone } from '../types'

export const showRegulatoryZoneMetadata =
  (
    partialRegulatoryZone: Pick<RegulatoryZone, 'topic' | 'zone'>,
    isPreviewing: boolean = false
  ): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    dispatch(regulationActions.setLoadingRegulatoryZoneMetadata())
    const { speciesByCode } = getState().species

    try {
      const feature = await getRegulatoryFeatureMetadataFromAPI(partialRegulatoryZone, getState().global.isBackoffice)

      const parsedRegulatoryZone = mapToRegulatoryZone(feature, speciesByCode)
      if (!parsedRegulatoryZone) {
        throw new Error('`parsedRegulatoryZone` is undefined.')
      }

      dispatch(regulationActions.setRegulatoryZoneMetadata(parsedRegulatoryZone))

      if (isPreviewing) {
        dispatch(regulationActions.setRegulatoryGeometriesToPreview([parsedRegulatoryZone]))
      }
    } catch (err) {
      dispatch(regulationActions.closeRegulatoryZoneMetadataPanel())
      dispatch(setError(err))
      dispatch(regulationActions.resetLoadingRegulatoryZoneMetadata())
      dispatch(regulationActions.resetRegulatoryGeometriesToPreview())
    }
  }
