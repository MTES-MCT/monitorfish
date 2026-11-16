import {
  REFERENTIAL_VERSIONS_POLLING_INTERVAL,
  referentialApi,
  saveLastReferentialVersions,
  useGetReferentialVersionsQuery
} from '@api/referential'
import { loadMainWindowReferentials } from '@features/MainWindow/useCases/loadMainWindowReferentials'
import { refreshChangedReferentials } from '@features/MainWindow/useCases/refreshChangedReferentials'
import { getAreFirstActiveVesselsDisplayedOrFailed } from '@features/Vessel/selectors/getAreFirstActiveVesselsDisplayedOrFailed'
import { updateVesselTracks } from '@features/Vessel/useCases/updateVesselTracks'
import { vesselApi } from '@features/Vessel/vesselApi'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { addMainAppListener } from '@store/listenerMiddleware'
import { isEqual } from 'lodash-es'
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

  useGetReferentialVersionsQuery(undefined, { pollingInterval: REFERENTIAL_VERSIONS_POLLING_INTERVAL })

  useEffect(
    () =>
      dispatch(
        addMainAppListener({
          effect: (action, listenerApi) => {
            saveLastReferentialVersions(action.payload)

            const previousVersions = referentialApi.endpoints.getReferentialVersions.select()(
              listenerApi.getOriginalState()
            ).data
            // The first versions are the ones the referentials are loaded with
            if (previousVersions && !isEqual(previousVersions, action.payload)) {
              listenerApi.dispatch(refreshChangedReferentials(previousVersions, action.payload))
            }
          },
          matcher: referentialApi.endpoints.getReferentialVersions.matchFulfilled
        })
      ),
    [dispatch]
  )
}
