import { useEffect, useRef } from 'react'
import { getLocalStorageState } from '../utils'

export const useSaveReportingInLocalStorage = (localStorageKey, key, value, isWithinValueObject) => {
  const firstUpdate = useRef(true)

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }

    const savedReporting = getLocalStorageState({}, localStorageKey) || {}

    if (isWithinValueObject) {
      if (!savedReporting.value) {
        savedReporting.value = {}
      }
      savedReporting.value[key] = value
    } else {
      savedReporting[key] = value
    }

    window.localStorage.setItem(localStorageKey, JSON.stringify(savedReporting))
  }, [key, value, isWithinValueObject])
}
