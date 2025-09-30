import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { alertApi } from '@features/Alert/apis'
import { setSilencedAlerts } from '@features/Alert/components/SideWindowAlerts/slice'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

export const getSilencedAlerts = () => async dispatch => {
  try {
    const silencedAlerts = await dispatch(
      alertApi.endpoints.getSilencedAlerts.initiate(undefined, RTK_FORCE_REFETCH_QUERY_OPTIONS)
    ).unwrap()

    dispatch(setSilencedAlerts(silencedAlerts))
  } catch (error) {
    dispatch(
      addSideWindowBanner({
        children: (error as Error).message,
        closingDelay: 6000,
        isClosable: true,
        level: Level.ERROR,
        withAutomaticClosing: true
      })
    )
  }
}
