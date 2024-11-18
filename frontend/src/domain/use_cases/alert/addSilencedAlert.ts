import { setSilencedAlerts } from '@features/Alert/components/SideWindowAlerts/slice'

import { alertApi } from '../../../api/alert'
import { setError } from '../../shared_slices/Global'

import type { MainAppThunk } from '../../../store'
import type { SilencedAlertData } from '@features/Alert/types'

/**
 * Add a new silenced alert
 */
export const addSilencedAlert =
  (silencedAlert: SilencedAlertData): MainAppThunk =>
  async (dispatch, getState) => {
    const previousSilencedAlerts = getState().alert.silencedAlerts

    try {
      /**
       * TODO Why is there this TS type issue as `data` is part of the response :
       * TS2339: Property 'data' does not exist on type '{ data: SilencedAlert; } | { error: FetchBaseQueryError | SerializedError; }'.
       */
      // @ts-ignore
      const { data: savedSilencedAlert, error: silencedAlertError } = await dispatch(
        alertApi.endpoints.createSilencedAlert.initiate(silencedAlert)
      )
      if (silencedAlertError) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw silencedAlertError
      }

      const nextSilencedAlerts = [savedSilencedAlert, ...previousSilencedAlerts]
      dispatch(setSilencedAlerts(nextSilencedAlerts))
    } catch (error) {
      await dispatch(setError(error))
    }
  }
