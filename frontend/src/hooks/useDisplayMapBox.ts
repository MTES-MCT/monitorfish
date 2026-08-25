import { useEffect, useState } from 'react'

export function useDisplayMapBox(condition: boolean) {
  const [isRendered, setIsRendered] = useState(condition)
  const [isOpened, setIsOpened] = useState(false)

  useEffect(() => {
    if (condition) {
      setIsRendered(true)
      const openingTimeoutId = setTimeout(() => setIsOpened(true), 50)

      return () => clearTimeout(openingTimeoutId)
    }

    setIsOpened(false)
    const closingTimeoutId = setTimeout(() => setIsRendered(false), 300)

    return () => clearTimeout(closingTimeoutId)
  }, [condition])

  return {
    isOpened,
    isRendered
  }
}
