import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { REPORTINGS_VECTOR_SOURCE } from '@features/Reporting/layers/ReportingLayer/constants'
import { reportingApi } from '@features/Reporting/reportingApi'
import { type ApiSearchFilter, ReportingSearchPeriod } from '@features/Reporting/types'
import { buildReportingFeature } from '@features/Reporting/utils'
import { Level } from '@mtes-mct/monitor-ui'

import type { MainAppThunk } from '@store'

export const searchAndRenderReportingFeatures =
  (filter: ApiSearchFilter): MainAppThunk =>
  async dispatch => {
    if (filter.reportingPeriod === ReportingSearchPeriod.CUSTOM && (!filter.startDate || !filter.endDate)) {
      return
    }

    try {
      const reportings = await dispatch(reportingApi.endpoints.searchReportings.initiate(filter)).unwrap()

      const features = reportings.map(reporting => buildReportingFeature(reporting))

      REPORTINGS_VECTOR_SOURCE.clear(true)
      REPORTINGS_VECTOR_SOURCE.addFeatures(features)
    } catch (error) {
      dispatch(
        addMainWindowBanner({
          children: (error as Error).message,
          closingDelay: 6000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }
