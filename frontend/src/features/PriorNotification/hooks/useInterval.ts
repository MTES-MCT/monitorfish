import { useEffect, useRef } from 'react'

export function useInterval(callback: () => void, condition: boolean, delay: number): void {
  const savedCallback = useRef<() => void>()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!condition) {
      return undefined
    }

    function tick() {
      if (savedCallback.current) {
        savedCallback.current()
      }
    }

    const intervalId = setInterval(tick, delay)

    return () => clearInterval(intervalId)
  }, [condition, delay])
}
