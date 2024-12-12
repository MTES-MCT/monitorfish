import { getRegulatoryFeatureMetadataFromAPI } from '../../../api/geoserver'
import { setError } from '../../../domain/shared_slices/Global'
import { regulationActions } from '../slice'
import { mapToRegulatoryZone } from '../utils'

import type { RegulatoryZone } from '../types'
import type { HybridAppDispatch, HybridAppThunk } from '@store/types'

export const showRegulatoryZoneMetadata =
  <T extends HybridAppDispatch>(
    partialRegulatoryZone: Pick<RegulatoryZone, 'topic' | 'zone'>,
    isPreviewing: boolean = false
  ): HybridAppThunk<T, Promise<void>> =>
  // @ts-ignore Required to avoid reducers typing conflicts. Not fancy but allows us to keep Thunk context type-checks.
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
