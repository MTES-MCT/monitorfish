import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { FrontendApiError } from '@libs/FrontendApiError'
import { Level } from '@mtes-mct/monitor-ui'
import { downloadAsCsv } from '@utils/downloadAsCsv'
import { handleThunkError } from '@utils/handleThunkError'
import dayjs from 'dayjs'

import { PRIOR_NOTIFICATIONS_CSV_MAP } from '../components/PriorNotificationList/csvMap'
import { priorNotificationApi } from '../priorNotificationApi'

import type { ListFilter } from '../components/PriorNotificationList/types'
import type { PriorNotification } from '../PriorNotification.types'
import type { BackendApi } from '@api/BackendApi.types'
import type { Logbook } from '@features/Logbook/Logbook.types'
import type { MainAppThunk } from '@store'

/**
 * Downloads all the prior notifications matching the list filter when `isAllSelected` is `true`,
 * including those not yet loaded in the list, or only the selected loaded ones otherwise.
 */
export const downloadPriorNotifications =
  ({
    apiSortingParams,
    isAllSelected,
    listFilter,
    loadedPriorNotifications,
    selectedReportIds,
    totalLength
  }: {
    apiSortingParams: BackendApi.RequestSortingParams<Logbook.ApiSortColumn>
    isAllSelected: boolean
    listFilter: ListFilter
    loadedPriorNotifications: PriorNotification.PriorNotification[]
    selectedReportIds: string[]
    totalLength: number
  }): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      const priorNotifications =
        isAllSelected && totalLength > loadedPriorNotifications.length
          ? (
              await dispatch(
                priorNotificationApi.endpoints.getPriorNotifications.initiate(
                  {
                    apiPaginationParams: { pageNumber: 0, pageSize: totalLength },
                    apiSortingParams,
                    listFilter
                  },
                  { subscribe: false }
                )
              ).unwrap()
            ).data
          : loadedPriorNotifications.filter(({ reportId }) => selectedReportIds.includes(reportId))

      const fileName = `${priorNotifications.length}-pno-${dayjs().format('DD-MM-YYYY')}`

      downloadAsCsv(fileName, priorNotifications, PRIOR_NOTIFICATIONS_CSV_MAP)
    } catch (err) {
      if (!(err instanceof FrontendApiError)) {
        handleThunkError(err)

        return
      }

      dispatch(
        addSideWindowBanner({
          children: "Nous n'avons pas pu télécharger les préavis.",
          closingDelay: 6000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }
