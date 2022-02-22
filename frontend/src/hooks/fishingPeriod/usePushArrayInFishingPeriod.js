import { useCallback } from 'react'
import useSetFishingPeriod from './useSetFishingPeriod'

const usePushArrayInFishingPeriod = (key, array, defaultValue) => {
  const set = useSetFishingPeriod(key)
  return useCallback(_ => {
    const newArray = array ? [...array] : []
    newArray.push(defaultValue || undefined)

    set(newArray)
  }, [array, defaultValue, set])
}

export default usePushArrayInFishingPeriod
