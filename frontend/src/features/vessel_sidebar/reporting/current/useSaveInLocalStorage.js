import { useEffect, useRef } from 'react'
import { getLocalStorageState } from '../../../../utils'

const newReportingLocalStorageKey = 'new-reporting'
export const useSaveReportingInLocalStorage = (key, value, isWithinValueObject) => {
  const firstUpdate = useRef(true)

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }

    const savedReporting = getLocalStorageState({}, newReportingLocalStorageKey) || {}

    if (isWithinValueObject) {
      if (!savedReporting.value) {
        savedReporting.value = {}
      }
      savedReporting.value[key] = value
    } else {
      savedReporting[key] = value
    }

    window.localStorage.setItem(newReportingLocalStorageKey, JSON.stringify(savedReporting))
  }, [key, value, isWithinValueObject])
}
