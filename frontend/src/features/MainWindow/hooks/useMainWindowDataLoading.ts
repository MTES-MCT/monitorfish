import { loadMainWindowReferentials } from '@features/MainWindow/useCases/loadMainWindowReferentials'
import { getAreFirstActiveVesselsDisplayedOrFailed } from '@features/Vessel/selectors/getAreFirstActiveVesselsDisplayedOrFailed'
import { updateVesselTracks } from '@features/Vessel/useCases/updateVesselTracks'
import { vesselApi } from '@features/Vessel/vesselApi'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { addMainAppListener } from '@store/listenerMiddleware'
import { useEffect } from 'react'

import { useIsSuperUser } from '../../../auth/hooks/useIsSuperUser'

export function useMainWindowDataLoading() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()

  // On a satellite link, these downloads would share its bandwidth with the vessels, delaying their display
  useEffect(
    () =>
      dispatch(
        addMainAppListener({
          effect: (_action, listenerApi) => {
            listenerApi.unsubscribe()
            listenerApi.dispatch(loadMainWindowReferentials(isSuperUser))
          },
          predicate: (_action, state) => getAreFirstActiveVesselsDisplayedOrFailed(state)
        })
      ),
    [dispatch, isSuperUser]
  )

  // With the vessels, not to wake a satellite link up more often
  useEffect(
    () =>
      dispatch(
        addMainAppListener({
          effect: (_action, listenerApi) => {
            listenerApi.dispatch(updateVesselTracks())
          },
          matcher: vesselApi.endpoints.getActiveVessels.matchFulfilled
        })
      ),
    [dispatch]
  )
}
