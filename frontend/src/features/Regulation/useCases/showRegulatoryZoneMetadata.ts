import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import { getRegulatoryFeatureMetadataFromAPI } from '../../../api/geoserver'
import { regulationActions } from '../slice'
import { mapToRegulatoryZone } from '../utils'

import type { RegulatoryZone } from '../types'
import type { HybridAppThunk } from '@store/types'

export const showRegulatoryZoneMetadata =
  (partialRegulatoryZone: Pick<RegulatoryZone, 'topic' | 'zone'>, isPreviewing: boolean = false): HybridAppThunk =>
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
      dispatch(
        addMainWindowBanner({
          children: (err as Error).message,
          closingDelay: 6000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
      dispatch(regulationActions.resetLoadingRegulatoryZoneMetadata())
      dispatch(regulationActions.resetRegulatoryGeometriesToPreview())
    }
  }
