import { useCallback, useEffect } from 'react'

import type { Promisable } from 'type-fest'

export const useListenForScroll = (
  action: () => Promisable<void>,
  baseContainer?: Document | HTMLDivElement | null
) => {
  const handleScrollEvent = useCallback(() => action(), [action])

  useEffect(() => {
    const globalContainer = baseContainer ?? window.document

    globalContainer.addEventListener('scroll', handleScrollEvent)

    return () => {
      globalContainer.removeEventListener('scroll', handleScrollEvent)
    }
  }, [baseContainer, handleScrollEvent])
}
