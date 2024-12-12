// TODO Move that into BackOffice feature.

import { useCallback } from 'react'

import { useSetFishingPeriod } from './useSetFishingPeriod'

import type { DateInterval, TimeInterval } from '@features/Regulation/types'
import type { FishingPeriodKey } from '@features/Regulation/utils'

export function useUpdateArrayInFishingPeriod<T extends Date | DateInterval | TimeInterval>(
  key: FishingPeriodKey,
  dates: T[] | undefined
): (id: number, nextDate: T | undefined) => void {
  const setArray = useSetFishingPeriod(key)

  return useCallback(
    (id: number, nextDate: T | undefined) => {
      // TODO `Array<Date | undefined>` is shady.
      const newArray: Array<T | undefined> = dates ? [...dates] : []

      if (id === -1) {
        newArray.push(nextDate)
      } else {
        newArray[id] = nextDate
      }
      setArray(newArray)
    },
    [dates, setArray]
  )
}
