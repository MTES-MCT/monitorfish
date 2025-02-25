import { useEffect, useState } from 'react'

export function useDisplayMapBox(condition: boolean) {
  const [isRendered, setIsRendered] = useState(condition)
  const [isOpened, setIsOpened] = useState(false)

  useEffect(() => {
    if (condition) {
      setIsRendered(true)
      setTimeout(() => setIsOpened(true), 50)

      return
    }

    setIsOpened(false)
    setTimeout(() => setIsRendered(false), 300)
  }, [condition])

  return {
    isOpened,
    isRendered
  }
}
