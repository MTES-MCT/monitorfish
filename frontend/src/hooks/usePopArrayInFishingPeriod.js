import { useCallback } from 'react'
import useSetFishingPeriod from './useSetFishingPeriod'

const usePopArrayInFishingPeriod = (key, array) => {
  const set = useSetFishingPeriod(key)
  return useCallback(_ => {
    const newArray = [...array]
    newArray.pop()

    set(newArray)
  }, [array, set])
}

export default usePopArrayInFishingPeriod
