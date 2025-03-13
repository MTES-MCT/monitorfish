import { alertApi } from '@api/alert'
import { setSilencedAlerts } from '@features/Alert/components/SideWindowAlerts/slice'

import { setError } from '../../../domain/shared_slices/Global'

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
      await dispatch(setError(error))
    }
  }
