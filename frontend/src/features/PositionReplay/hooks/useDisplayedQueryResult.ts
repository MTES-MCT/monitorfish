import { PositionReplayStatus } from '@features/PositionReplay/slice'
import { useMainAppSelector } from '@hooks/useMainAppSelector'

export type QueryResult<T> = {
  data?: T[] | undefined
  error?: unknown
  isError: boolean
  isFetching: boolean
}

/** The current query result, or the replayed one while positions are replayed. */
export function selectDisplayedQueryResult<T>(
  status: PositionReplayStatus,
  currentQueryResult: QueryResult<T>,
  replayedQueryResult: QueryResult<T>
): QueryResult<T> {
  return status === PositionReplayStatus.OFF ? currentQueryResult : replayedQueryResult
}

export function useDisplayedQueryResult<T>(
  currentQueryResult: QueryResult<T>,
  replayedQueryResult: QueryResult<T>
): QueryResult<T> {
  const status = useMainAppSelector(state => state.positionReplay.status)

  return selectDisplayedQueryResult(status, currentQueryResult, replayedQueryResult)
}
