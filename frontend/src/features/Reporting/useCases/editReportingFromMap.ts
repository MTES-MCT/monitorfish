import { WindowContext } from '@api/constants'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { displayedComponentActions } from '../../../domain/shared_slices/DisplayedComponent'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { reportingApi } from '../reportingApi'
import { reportingActions } from '../slice'

import type { MainAppThunk } from '@store'

export const editReportingFromMap =
  (reportingId: number): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      const reporting = await dispatch(reportingApi.endpoints.getReportingById.initiate(reportingId)).unwrap()

      dispatch(reportingActions.setEditedReporting(reporting))
      dispatch(displayedComponentActions.setDisplayedComponents({ isReportingMapFormDisplayed: true }))
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => editReportingFromMap(reportingId),
          true,
          DisplayedErrorKey.VESSEL_SIDEBAR_ERROR,
          WindowContext.MainWindow
        )
      )
    }
  }
