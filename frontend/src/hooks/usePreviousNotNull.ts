import { useEffect, useRef } from 'react'

export function usePreviousNotNull<T = any>(value: T): T | undefined {
  const ref = useRef<T | undefined>()

  useEffect(() => {
    if (value) {
      ref.current = value
    }
  }, [value]) // Only re-run if value changes

  return ref.current
}
