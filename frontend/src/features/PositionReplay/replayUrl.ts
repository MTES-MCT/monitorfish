import { toReplayedDateTime } from '@features/PositionReplay/replayedDateTime'
import { customDayjs } from '@mtes-mct/monitor-ui'

import type { Dayjs } from 'dayjs'

/** A reload or a shared link reopens the replay at the same date. */
const REPLAY_URL_PARAM = 'replay'

/** The replayed date of a URL, ignored when invalid or in the future. */
export function getReplayedDateTimeFromUrl(url: string, now: Dayjs): string | undefined {
  const dateTime = new URL(url).searchParams.get(REPLAY_URL_PARAM)
  if (!dateTime) {
    return undefined
  }

  const parsedDateTime = customDayjs(dateTime)
  if (!parsedDateTime.isValid() || parsedDateTime.isAfter(now)) {
    return undefined
  }

  return toReplayedDateTime(parsedDateTime)
}

/** Keeps the path and the map view hash. */
export function getUrlWithReplayedDateTime(url: string, replayedDateTime: string | undefined): string {
  const nextUrl = new URL(url)
  if (replayedDateTime) {
    nextUrl.searchParams.set(REPLAY_URL_PARAM, replayedDateTime)
  } else {
    nextUrl.searchParams.delete(REPLAY_URL_PARAM)
  }

  return nextUrl.toString()
}
