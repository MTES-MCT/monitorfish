import { useCallback } from 'react'
import useSetFishingPeriod from './useSetFishingPeriod'

const useUpdateArrayInFishingPeriod = (key, array) => {
  const setArray = useSetFishingPeriod(key)

  return useCallback((id, value) => {
    const newArray = array ? [...array] : []

    if (id === -1) {
      newArray.push(value)
    } else {
      newArray[id] = value
    }
    setArray(newArray)
  }, [array, setArray])
}

export default useUpdateArrayInFishingPeriod
