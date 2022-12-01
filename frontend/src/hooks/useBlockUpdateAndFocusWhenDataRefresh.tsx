import { useEffect, useRef, useState } from 'react'

export function useBlockUpdateAndFocusWhenDataRefresh(savedData) {
  const [isUpdateBlocked, setIsUpdateBlocked] = useState(false)
  const inputDataCySelectorRef = useRef('')
  const intervalRef = useRef<NodeJS.Timer>()

  const blockUpdate = () => setIsUpdateBlocked(true)
  const setInputDataCySelector = dataCySelector => {
    inputDataCySelectorRef.current = dataCySelector
  }
  const focusAndUnblock = () => {
    const domElement = document.querySelector(`[data-cy="${inputDataCySelectorRef.current}"]`)
    if (!domElement) {
      return
    }

    const timeout = setTimeout(() => {
      // @ts-ignore
      domElement.focus()
      clearTimeout(timeout)
    }, 200)

    setIsUpdateBlocked(false)
    clearInterval(intervalRef.current)
  }

  useEffect(() => {
    if (!isUpdateBlocked) {
      return undefined
    }

    intervalRef.current = setInterval(focusAndUnblock, 200)

    return () => clearInterval(intervalRef.current)
  }, [savedData, isUpdateBlocked])

  return {
    blockUpdate,
    isUpdateBlocked,
    setInputDataCySelector
  }
}
