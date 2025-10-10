import { useEffect, useState } from 'react'

export const useClickOutsideWhenOpenedWithinRef = (ref, isOpened, baseRef) => {
  const [clicked, setClicked] = useState(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setClicked({})
      } else {
        setClicked(null)
      }
    }

    const current = baseRef?.current

    // Bind the event listener
    if (isOpened) {
      if (baseRef) {
        current?.addEventListener('mousedown', handleClickOutside)
      } else {
        document.addEventListener('mousedown', handleClickOutside)
      }
    }

    return () => {
      // Unbind the event listener on clean up
      if (baseRef) {
        current?.removeEventListener('mousedown', handleClickOutside)
      } else {
        document.addEventListener('mousedown', handleClickOutside)
      }
    }
  }, [ref, isOpened, baseRef])

  return clicked
}
