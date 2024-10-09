import { archiveReportingsFromAPI } from '@api/reporting'
import { getVesselReportings } from '@features/Reporting/useCases/getVesselReportings'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { Vessel } from '../../../domain/entities/vessel/vessel'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { removeVesselReportings } from '../../Vessel/slice'
import { removeReportingsIdsFromCurrentReportings } from '../slice'

import type { InfractionSuspicionReporting, PendingAlertReporting } from '@features/Reporting/types'
import type { MainAppThunk } from '@store'

export const archiveReportings =
  (ids: number[]): MainAppThunk =>
  async (dispatch, getState) => {
    const { currentReportings } = getState().reporting
    const reportingsInformation = getReportingsInformationFromIds(ids, currentReportings)

    try {
      await archiveReportingsFromAPI(ids)

      dispatch(removeReportingsIdsFromCurrentReportings(ids))
      dispatch(removeVesselReportings(reportingsInformation))
      dispatch(renderVesselFeatures())

      await dispatch(getVesselReportings(false))
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => archiveReportings(ids),
          true,
          DisplayedErrorKey.SIDE_WINDOW_REPORTING_LIST_ERROR
        )
      )
    }
  }

function getReportingsInformationFromIds(
  ids: number[],
  currentReportings: Array<InfractionSuspicionReporting | PendingAlertReporting>
) {
  return ids
    .map(id => {
      const foundReporting = currentReportings.find(reporting => reporting.id === id)
      if (!foundReporting) {
        return null
      }

      return {
        id: foundReporting.id,
        type: foundReporting.type,
        vesselFeatureId: Vessel.getVesselFeatureId(foundReporting)
      }
    })
    .filter(reporting => reporting)
}
