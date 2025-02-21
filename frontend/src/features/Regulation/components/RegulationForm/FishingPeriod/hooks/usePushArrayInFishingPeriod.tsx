// TODO Move that into BackOffice feature.

import { useCallback } from 'react'

import { useSetFishingPeriod } from './useSetFishingPeriod'

export function usePushArrayInFishingPeriod(key: string, array: any[] | undefined, defaultValue?: any) {
  const set = useSetFishingPeriod(key)

  return useCallback(
    _ => {
      const newArray = array ? [...array] : []
      newArray.push(defaultValue || undefined)

      set(newArray)
    },
    [array, defaultValue, set]
  )
}
