import { useEffect, useState } from 'react'

export const useClickOutsideWhenOpenedWithinRef = (ref, isOpened, baseRef) => {
  const [clicked, setClicked] = useState(null)

  useEffect(() => {
    function handleClickOutside (event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setClicked({})
      } else {
        setClicked(null)
      }
    }

    // Bind the event listener
    if (isOpened) {
      baseRef.current?.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      // Unbind the event listener on clean up
      baseRef.current?.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, isOpened])

  return clicked
}
