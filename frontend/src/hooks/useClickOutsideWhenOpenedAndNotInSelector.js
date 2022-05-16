import { useEffect, useState } from 'react'

export const useClickOutsideWhenOpenedAndNotInSelector = (ref, isOpened, selector) => {
  const [clicked, setClicked] = useState(null)

  useEffect(() => {
    function handleClickOutside (event) {
      const element = document.querySelector(selector)
      if (ref.current && !ref.current.contains(event.target) && !element?.contains(event.target)) {
        setClicked({})
      } else {
        setClicked(null)
      }
    }

    // Bind the event listener
    if (isOpened) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, isOpened])

  return clicked
}
