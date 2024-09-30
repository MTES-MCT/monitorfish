import { useEffect, useRef } from 'react'

export function useInterval(callback: () => void, condition: boolean, delay: number): void {
  const savedCallback = useRef<() => void>()
  const intervalId = useRef<number | undefined>()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!condition) {
      return () => clearInterval(intervalId.current)
    }

    function tick() {
      if (savedCallback.current) {
        savedCallback.current()
      }
    }

    intervalId.current = window.setInterval(tick, delay)

    return () => clearInterval(intervalId.current)
  }, [condition, delay])
}
