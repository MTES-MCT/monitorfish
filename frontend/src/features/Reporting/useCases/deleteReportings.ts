import { WindowContext } from '@api/constants'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { isNotNullish } from '@utils/isNotNullish'

import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { removeVesselReportings } from '../../Vessel/slice'
import { reportingApi } from '../reportingApi'

import type { Reporting } from '@features/Reporting/types'
import type { MainAppThunk } from '@store'

export const deleteReportings =
  (reportings: Reporting.Reporting[], ids: number[], windowContext: WindowContext): MainAppThunk<Promise<void>> =>
  async dispatch => {
    const reportingsInformation = getReportingsInformationFromIds(ids, reportings)

    try {
      await dispatch(reportingApi.endpoints.deleteReportings.initiate(ids)).unwrap()

      dispatch(removeVesselReportings(reportingsInformation))

      dispatch(renderVesselFeatures())
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => deleteReportings(reportings, ids, windowContext),
          true,
          windowContext === WindowContext.MainWindow
            ? DisplayedErrorKey.MAIN_WINDOW_REPORTING_LIST_ERROR
            : DisplayedErrorKey.SIDE_WINDOW_REPORTING_LIST_ERROR,
          windowContext
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
        vesselFeatureId: VesselFeature.getVesselFeatureId(foundReporting)
      }
    })
    .filter(isNotNullish)
}
