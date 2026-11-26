import { PositionReplayStatus } from '@features/PositionReplay/slice'
import { useMainAppSelector } from '@hooks/useMainAppSelector'

export type QueryResult<T> = {
  data?: T[] | undefined
  error?: unknown
  isError: boolean
  isFetching: boolean
}

const NO_DATA: never[] = []

/**
 * The current query result, or the replayed one while positions are replayed.
 * Nothing is displayed until a replayed date is picked.
 */
export function selectDisplayedQueryResult<T>(
  status: PositionReplayStatus,
  currentQueryResult: QueryResult<T>,
  replayedQueryResult: QueryResult<T>
): QueryResult<T> {
  switch (status) {
    case PositionReplayStatus.OFF:
      return currentQueryResult
    case PositionReplayStatus.PICKING_DATE:
      return { ...replayedQueryResult, data: NO_DATA }
    case PositionReplayStatus.REPLAYING:
    default:
      return replayedQueryResult
  }
}

export function useDisplayedQueryResult<T>(
  currentQueryResult: QueryResult<T>,
  replayedQueryResult: QueryResult<T>
): QueryResult<T> {
  const status = useMainAppSelector(state => state.positionReplay.status)

  return selectDisplayedQueryResult(status, currentQueryResult, replayedQueryResult)
}
