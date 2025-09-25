import { alertApi } from '@features/Alert/apis'
import { setSilencedAlerts } from '@features/Alert/components/SideWindowAlerts/slice'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import type { SilencedAlertData } from '@features/Alert/types'
import type { MainAppThunk } from '@store'

/**
 * Add a new silenced alert
 */
export const addSilencedAlert =
  (silencedAlert: SilencedAlertData): MainAppThunk =>
  async (dispatch, getState) => {
    // @ts-ignore
    const previousSilencedAlerts = getState().alert.silencedAlerts

    try {
      /**
       * TODO Why is there this TS type issue as `data` is part of the response :
       * TS2339: Property 'data' does not exist on type '{ data: SilencedAlert; } | { error: FetchBaseQueryError | SerializedError; }'.
       */
      const savedSilencedAlert = await dispatch(alertApi.endpoints.createSilencedAlert.initiate(silencedAlert)).unwrap()

      const nextSilencedAlerts = [savedSilencedAlert, ...previousSilencedAlerts]
      dispatch(setSilencedAlerts(nextSilencedAlerts))
    } catch (error) {
      dispatch(
        addSideWindowBanner({
          children: (error as Error).message,
          closingDelay: 3000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }
