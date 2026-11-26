import { getReplayedDateTimeFromUrl, getUrlWithReplayedDateTime } from '@features/PositionReplay/replayUrl'
import { selectPositionsDateTime } from '@features/PositionReplay/selectors'
import { positionReplayActions } from '@features/PositionReplay/slice'
import { startPositionReplay } from '@features/PositionReplay/useCases/startPositionReplay'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { usePrevious } from '@mtes-mct/monitor-ui'
import { customDayjs } from '@mtes-mct/monitor-ui'
import { useEffect } from 'react'

/** Restores the replay from the URL on load, then keeps the URL in sync with the replayed date. */
export function useReplayedDateTimeInUrl() {
  const dispatch = useMainAppDispatch()
  const positionsDateTime = useMainAppSelector(selectPositionsDateTime)
  const previousPositionsDateTime = usePrevious(positionsDateTime)

  useEffect(() => {
    const replayedDateTime = getReplayedDateTimeFromUrl(window.location.href, customDayjs())
    if (!replayedDateTime) {
      return
    }

    dispatch(startPositionReplay())
    dispatch(positionReplayActions.setDateTime(replayedDateTime))
  }, [dispatch])

  useEffect(() => {
    if (positionsDateTime === previousPositionsDateTime) {
      return
    }

    window.history.replaceState(
      window.history.state,
      '',
      getUrlWithReplayedDateTime(window.location.href, positionsDateTime)
    )
  }, [positionsDateTime, previousPositionsDateTime])
}
