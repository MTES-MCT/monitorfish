import { MutableRefObject, Ref, RefObject, useEffect, useRef } from 'react'

export function useCombinedRefs<T>(...refs: Ref<T | undefined>[]): RefObject<T> {
  const targetRef = useRef<T>(null)

  useEffect(() => {
    refs.forEach(ref => {
      if (!ref) {
        return
      }

      if (typeof ref === 'function') {
        ref(targetRef.current)
      } else {
        /* eslint-disable no-param-reassign */
        ;(ref as MutableRefObject<T | null>).current = targetRef.current
      }
    })
  }, [refs])

  return targetRef
}
