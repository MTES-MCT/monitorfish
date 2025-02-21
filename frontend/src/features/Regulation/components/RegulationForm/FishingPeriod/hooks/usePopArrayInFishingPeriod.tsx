// TODO Move that into BackOffice feature.

import { useCallback } from 'react'

import { useSetFishingPeriod } from './useSetFishingPeriod'

export function usePopArrayInFishingPeriod(key, array) {
  const set = useSetFishingPeriod(key)

  return useCallback(
    _ => {
      const newArray = [...array]
      newArray.pop()

      set(newArray)
    },
    [array, set]
  )
}
