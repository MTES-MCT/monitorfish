import { useEffect, useRef } from 'react'

export function usePreviousIf<T = any>(value: T, condition: boolean): T | undefined {
  const ref = useRef<T | undefined>()

  useEffect(() => {
    if (condition) {
      ref.current = value
    }
  }, [condition, value])

  return ref.current
}
