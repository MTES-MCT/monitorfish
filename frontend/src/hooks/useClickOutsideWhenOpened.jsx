import { useEffect, useState } from 'react'

export const useClickOutsideWhenOpened = (ref, isOpened) => {
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
      document.addEventListener('mousedown', handleClickOutside)
      return
    }

    document.removeEventListener('mousedown', handleClickOutside)
    setClicked(null)

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, isOpened])

  return clicked
}
