import { RtkCacheTagType, WindowContext } from '@api/constants'
import { archiveReportingsFromAPI } from '@api/reporting'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { vesselApi } from '@features/Vessel/vesselApi'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { Vessel } from '../../../domain/entities/vessel/vessel'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { removeVesselReportings } from '../../Vessel/slice'
import { reportingApi } from '../reportingApi'

import type { Reporting } from '@features/Reporting/types'
import type { MainAppThunk } from '@store'

export const archiveReportings =
  (reportings: Reporting.Reporting[], reportingIdsToArchive: number[], windowContext: WindowContext): MainAppThunk =>
  async dispatch => {
    const reportingsInformation = getReportingsInformationFromIds(reportingIdsToArchive, reportings)

    try {
      await archiveReportingsFromAPI(reportingIdsToArchive)
      dispatch(reportingApi.util.invalidateTags([RtkCacheTagType.Reportings]))
      dispatch(vesselApi.util.invalidateTags([RtkCacheTagType.Reportings]))

      dispatch(removeVesselReportings(reportingsInformation))

      dispatch(renderVesselFeatures())
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => archiveReportings(reportings, reportingIdsToArchive, windowContext),
          true,
          windowContext === WindowContext.MainWindow
            ? DisplayedErrorKey.MAIN_WINDOW_REPORTING_LIST_ERROR
            : DisplayedErrorKey.SIDE_WINDOW_REPORTING_LIST_ERROR
        )
      )
    }
  }

function getReportingsInformationFromIds(ids: number[], currentReportings: Reporting.Reporting[]) {
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
